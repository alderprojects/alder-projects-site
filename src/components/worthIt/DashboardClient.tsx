'use client'

// V7 — Worth-It Plan dashboard interactive client.
//
// V7.1 changes:
// - First-view confirmation banner that fades in on first render
// - "Project complexity" relabel (was "Worth-It Score") + drop the
//   "Light/Moderate/Strong" sub-label when the score is < 6.0
// - Per-row "Not relevant" dismiss with state.dismissedMoveIds
// - Empty path tabs are filtered out (Section 5)
// - Four context modals (Start checklist, View Skip List, DIY Stop
//   Line, Compare Paths) replace the dead Card "→" labels

import { useEffect, useRef, useState, useTransition } from 'react'
import type { WorthItOutput } from '@/lib/buildWorthItPlan'
import type { PlanState } from '@/lib/storage'
import type { Move } from '@/content/moves'
import PunchListModal from './PunchListModal'
import ProjectGrewModal from './ProjectGrewModal'
import PathContextModal from './PathContextModal'

type Props = {
  plan: WorthItOutput
  initialState: PlanState
  token: string | null
}

type ContextModalId =
  | null
  | 'start_checklist'
  | 'skip_list'
  | 'diy_stop_line'
  | 'compare_paths'

export default function DashboardClient({ plan, initialState, token }: Props) {
  const [state, setState] = useState<PlanState>(initialState)
  // Section 5 — only render path tabs that have content. Pre-compute
  // the visible tabs so the active id stays in range.
  const visiblePaths = plan.planPaths.filter(
    p => (plan.movesByPath[p.id]?.length ?? 0) > 0,
  )
  const [activePathId, setActivePathId] = useState<string>(
    visiblePaths.find(p => p.id === state.selectedPath)?.id
      ?? visiblePaths[0]?.id
      ?? plan.planPaths[0]?.id
      ?? 'best_overall',
  )
  const [punchOpen, setPunchOpen] = useState(false)
  const [grewOpen, setGrewOpen] = useState(false)
  const [contextModal, setContextModal] = useState<ContextModalId>(null)
  const [shareToast, setShareToast] = useState<string | null>(null)
  const [showFirstViewBanner, setShowFirstViewBanner] = useState(false)
  const [, startTransition] = useTransition()
  const firstViewSet = useRef(false)

  // First-view banner — fade in on first load if firstViewedAt is unset,
  // then mark it server-side so subsequent loads stay quiet.
  useEffect(() => {
    if (firstViewSet.current) return
    if (!state.firstViewedAt) {
      setShowFirstViewBanner(true)
      firstViewSet.current = true
      void patchState({ firstViewedAt: new Date().toISOString() })
      const timeout = window.setTimeout(() => setShowFirstViewBanner(false), 5000)
      return () => window.clearTimeout(timeout)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  async function patchState(patch: Partial<PlanState>) {
    const next: PlanState = { ...state, ...patch }
    setState(next)
    if (!token) return
    startTransition(async () => {
      try {
        await fetch(`/api/plan/${plan.planCode}/state?token=${encodeURIComponent(token)}`, {
          method: 'PATCH',
          headers: { 'content-type': 'application/json' },
          body: JSON.stringify(patch),
        })
      } catch {
        setShareToast('Could not save. Try again.')
        window.setTimeout(() => setShareToast(null), 3000)
      }
    })
  }

  function toggleSavedMove(moveId: string) {
    const saved = state.savedMoveIds.includes(moveId)
      ? state.savedMoveIds.filter(id => id !== moveId)
      : [...state.savedMoveIds, moveId]
    void patchState({ savedMoveIds: saved })
  }

  function dismissMove(moveId: string) {
    if (state.dismissedMoveIds.includes(moveId)) return
    void patchState({
      dismissedMoveIds: [...state.dismissedMoveIds, moveId],
    })
  }

  function toggleReminder(id: keyof PlanState['reminderPreferences']) {
    void patchState({
      reminderPreferences: {
        ...state.reminderPreferences,
        [id]: !state.reminderPreferences[id],
      },
    })
  }

  function switchPath(pathId: string) {
    setActivePathId(pathId)
    void patchState({ selectedPath: pathId })
  }

  async function copyShareLink() {
    const url = `${window.location.origin}/worth-it/dashboard/${plan.planCode}${token ? `?token=${token}` : ''}`
    try {
      await navigator.clipboard.writeText(url)
      setShareToast('Link copied to clipboard.')
      void patchState({ shareCount: state.shareCount + 1 })
    } catch {
      setShareToast('Copy failed. Use the URL bar.')
    }
    window.setTimeout(() => setShareToast(null), 2500)
  }

  function copyPlanCode() {
    void navigator.clipboard?.writeText(plan.planCode)
    setShareToast('Plan code copied.')
    window.setTimeout(() => setShareToast(null), 2000)
  }

  function startChecklist() {
    void patchState({ checklistStarted: true })
    setContextModal('start_checklist')
  }

  function downloadPdf() {
    if (!token) return
    window.open(
      `/api/plan/${plan.planCode}/pdf?token=${encodeURIComponent(token)}`,
      '_blank',
    )
    void patchState({ pdfDownloaded: true })
  }

  const movesForPath = (plan.movesByPath[activePathId] ?? []).filter(
    m => !state.dismissedMoveIds.includes(m.id),
  )

  return (
    <>
      <Header plan={plan} onShare={copyShareLink} onDownload={downloadPdf} />

      {showFirstViewBanner && (
        <FirstViewBanner plan={plan} />
      )}

      <div className="max-w-6xl mx-auto px-4 py-8">
        <PlanIdentity plan={plan} onCopyCode={copyPlanCode} onCopyLink={copyShareLink} />

        <PathCardsRow
          plan={plan}
          onStartChecklist={startChecklist}
          onBundleClick={() => setPunchOpen(true)}
          onGrewClick={() => setGrewOpen(true)}
        />

        <MovesTable
          plan={plan}
          visiblePaths={visiblePaths}
          activePathId={activePathId}
          onSwitchPath={switchPath}
          movesForPath={movesForPath}
          savedIds={state.savedMoveIds}
          onToggleSaved={toggleSavedMove}
          onDismiss={dismissMove}
        />

        <SupportingCards
          plan={plan}
          onSkipList={() => setContextModal('skip_list')}
          onDiyStopLine={() => setContextModal('diy_stop_line')}
          onComparePaths={() => setContextModal('compare_paths')}
          onStartChecklist={startChecklist}
        />

        <SummaryBar plan={plan} />

        <ActionBar
          plan={plan}
          state={state}
          onStartChecklist={startChecklist}
          onShare={copyShareLink}
          onDownload={downloadPdf}
          onToggleReminder={toggleReminder}
        />
      </div>

      {shareToast && <Toast text={shareToast} />}
      {punchOpen && (
        <PunchListModal
          plan={plan}
          token={token}
          checkedIds={state.checkedTaskIds}
          savedIds={state.savedMoveIds}
          onClose={() => setPunchOpen(false)}
        />
      )}
      {grewOpen && (
        <ProjectGrewModal
          plan={plan}
          token={token}
          onClose={() => setGrewOpen(false)}
        />
      )}
      {contextModal === 'start_checklist' && (
        <PathContextModal
          plan={plan}
          token={token}
          title="Start your checklist"
          intro="Walk through the highest-payoff moves one at a time. Mark each as done, skip it, or send it to a pro."
          ctaLabel="Get help with this checklist →"
          ctaIntentType="chat_followup"
          ctaTrigger="start_checklist"
          onClose={() => setContextModal(null)}
        >
          <ol className="space-y-3 text-sm">
            {plan.thisSaturday.slice(0, 5).map((m, i) => (
              <li
                key={m.id}
                className="border border-[#e8e3d4] rounded-md p-3 flex items-start gap-3"
              >
                <span className="w-6 h-6 rounded-full bg-[#1f3a2e] text-white inline-flex items-center justify-center text-xs flex-shrink-0">
                  {i + 1}
                </span>
                <div>
                  <div className="font-medium text-[#1a1f1a]">{m.title}</div>
                  <div className="text-xs text-[#1a1f1a]/65 mt-0.5">
                    {m.timeMinutes < 60
                      ? `${m.timeMinutes} min`
                      : `${Math.round(m.timeMinutes / 60)} hr`}
                    {' · '}${m.spend.low}
                    {m.spend.low !== m.spend.high && `-$${m.spend.high}`}
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </PathContextModal>
      )}
      {contextModal === 'skip_list' && (
        <PathContextModal
          plan={plan}
          token={token}
          title="What to skip"
          intro="The avoid list for this project. Each entry pairs the dollar amount avoided with the reason it does not earn its dollar."
          ctaLabel="Want help avoiding these? →"
          ctaIntentType="chat_followup"
          ctaTrigger="skip_list_view"
          onClose={() => setContextModal(null)}
        >
          <ul className="space-y-3 text-sm">
            {plan.whatToSkip.map(s => (
              <li key={s.id} className="border-b border-[#e8e3d4] pb-3">
                <strong className="block text-[#1a1f1a]">{s.title}</strong>
                <p className="text-[#1a1f1a]/80 mt-1">{s.reasoning}</p>
                <p className="text-xs text-[#1a1f1a]/55 mt-1">
                  Avoided: {s.moneyAvoided}
                </p>
              </li>
            ))}
          </ul>
        </PathContextModal>
      )}
      {contextModal === 'diy_stop_line' && (
        <PathContextModal
          plan={plan}
          token={token}
          title="DIY Stop Line"
          intro="The conditions that end DIY territory and start the call-a-pro conversation. Vermont specifics included where they apply."
          ctaLabel="I need a pro for this →"
          ctaIntentType="contractor_needed"
          ctaTrigger="diy_stop_line_view"
          onClose={() => setContextModal(null)}
        >
          <ul className="space-y-3 text-sm">
            {plan.diyStopLine.map(s => (
              <li key={s.id} className="border-b border-[#e8e3d4] pb-3">
                <strong className="block text-[#1a1f1a]">{s.trigger}</strong>
                <p className="text-[#1a1f1a]/80 mt-1">{s.why}</p>
                <p className="text-xs text-[#1a1f1a]/60 mt-1">
                  Who to call: <strong>{s.whoToCall}</strong>
                </p>
              </li>
            ))}
          </ul>
        </PathContextModal>
      )}
      {contextModal === 'compare_paths' && (
        <PathContextModal
          plan={plan}
          token={token}
          title="Compare paths"
          intro="Side by side: how each plan path differs in scope, time, and number of moves."
          ctaLabel="Help me decide →"
          ctaIntentType="chat_followup"
          ctaTrigger="compare_paths_view"
          onClose={() => setContextModal(null)}
        >
          <div className="grid sm:grid-cols-2 gap-3 text-sm">
            {visiblePaths.map(p => {
              const moves = plan.movesByPath[p.id] ?? []
              const totalSpendLow = moves.reduce((a, m) => a + (m.spend?.low ?? 0), 0)
              const totalSpendHigh = moves.reduce((a, m) => a + (m.spend?.high ?? 0), 0)
              return (
                <div
                  key={p.id}
                  className="border border-[#e8e3d4] rounded-md p-3"
                >
                  <div className="font-medium text-[#1f3a2e]">{p.label}</div>
                  <div className="text-xs text-[#1a1f1a]/65 mt-1">
                    {moves.length} move{moves.length === 1 ? '' : 's'} · ${totalSpendLow}
                    {totalSpendLow !== totalSpendHigh && `-$${totalSpendHigh}`}
                  </div>
                </div>
              )
            })}
          </div>
        </PathContextModal>
      )}
    </>
  )
}

// ============== Subcomponents =======================================

function FirstViewBanner({ plan }: { plan: WorthItOutput }) {
  return (
    <div className="bg-[#f5efe2] border-b border-[#e8e3d4] text-sm text-[#1a1f1a]/85">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center gap-3">
        <span className="w-5 h-5 rounded-full bg-[#1f3a2e] text-white inline-flex items-center justify-center text-[10px]">
          ✓
        </span>
        <span>
          Your Worth-It Plan is ready. Plan code{' '}
          <code className="font-mono bg-white border border-[#e8e3d4] rounded px-1.5">
            {plan.planCode}
          </code>{' '}
          saved to <strong>{plan.customerEmail}</strong>. Use the link in your
          email to return anytime.
        </span>
      </div>
    </div>
  )
}

function Header({
  plan,
  onShare,
  onDownload,
}: {
  plan: WorthItOutput
  onShare: () => void
  onDownload: () => void
}) {
  return (
    <header className="bg-[#1f3a2e] text-white">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <a href="/" className="font-display text-2xl">Alder</a>
        <div className="flex items-center gap-3 text-sm">
          <a href="/worth-it/find" className="hover:underline opacity-90">Find My Plan</a>
          <button onClick={onShare} className="border border-white/30 hover:bg-white/10 rounded-md px-3 py-1.5">Share</button>
          <button onClick={onDownload} className="border border-white/30 hover:bg-white/10 rounded-md px-3 py-1.5">Download PDF</button>
        </div>
      </div>
      {plan.upgradedFromCartId && (
        <div className="bg-[#162a21] text-white/80 text-xs px-4 py-2 text-center">
          Upgraded from Smart Cart {plan.upgradedFromCartId}
        </div>
      )}
    </header>
  )
}

function PlanIdentity({
  plan,
  onCopyCode,
  onCopyLink,
}: {
  plan: WorthItOutput
  onCopyCode: () => void
  onCopyLink: () => void
}) {
  const title = `${labelForTopic(plan.topic)}: ${plan.scopeLabel}`
  return (
    <section className="bg-white border border-[#e8e3d4] rounded-xl p-6 md:p-8 mb-6 grid md:grid-cols-3 gap-6">
      <div className="md:col-span-2">
        <h1 className="font-display text-3xl text-[#1a1f1a] leading-tight mb-2">{title}</h1>
        {plan.address && (
          <div className="text-sm text-[#1a1f1a]/70 mb-3 flex items-center gap-2">
            <PinIcon /> {plan.address}
          </div>
        )}
        <div className="text-sm text-[#1a1f1a]/85">
          Plan saved — use your private link or plan code to come back anytime.
        </div>
      </div>
      <aside className="space-y-3 text-sm">
        <IdentityCard label="Plan Code" value={plan.planCode} actionLabel="Copy Code" onAction={onCopyCode} />
        <IdentityCard label="Private Link" value={`alder.../plan/${plan.planCode}`} actionLabel="Copy Link" onAction={onCopyLink} />
        <IdentityCard label="Share Plan" value="Email or text" actionLabel="Share" onAction={onCopyLink} />
      </aside>
    </section>
  )
}

function IdentityCard({
  label,
  value,
  actionLabel,
  onAction,
}: {
  label: string
  value: string
  actionLabel: string
  onAction: () => void
}) {
  return (
    <div className="bg-[#fbf8f1] border border-[#e8e3d4] rounded-md p-3">
      <div className="text-xs uppercase tracking-wide text-[#1a1f1a]/60">{label}</div>
      <div className="font-mono text-sm text-[#1a1f1a] truncate my-1">{value}</div>
      <button
        type="button"
        onClick={onAction}
        className="text-xs text-[#1f3a2e] underline-offset-2 hover:underline"
      >
        {actionLabel}
      </button>
    </div>
  )
}

function PathCardsRow({
  plan,
  onStartChecklist,
  onBundleClick,
  onGrewClick,
}: {
  plan: WorthItOutput
  onStartChecklist: () => void
  onBundleClick: () => void
  onGrewClick: () => void
}) {
  return (
    <section className="grid md:grid-cols-3 gap-4 mb-6">
      <article className="bg-[#1f3a2e] text-white rounded-xl p-6">
        <div className="text-xs uppercase tracking-wide opacity-80 mb-2">Best Path for You</div>
        <h3 className="font-display text-xl mb-2">{plan.bestPath.title}</h3>
        <p className="text-sm opacity-90 mb-4">{plan.bestPath.description}</p>
        <button
          type="button"
          onClick={onStartChecklist}
          className="bg-white text-[#1f3a2e] font-medium text-sm px-4 py-2 rounded-md hover:bg-[#f5efe2]"
        >
          {plan.bestPath.ctaCopy} →
        </button>
      </article>

      <article className="bg-[#f5efe2] border border-[#e8e3d4] rounded-xl p-6">
        <div className="text-xs uppercase tracking-wide text-[#1a1f1a]/60 mb-2">Bundle Small Fixes</div>
        <h3 className="font-display text-xl text-[#1f3a2e] mb-2">Group related fixes</h3>
        <p className="text-sm text-[#1a1f1a]/85 mb-4">Combine moves into a single punch list — fewer trips, better material discounts.</p>
        <button
          type="button"
          onClick={onBundleClick}
          className="bg-[#1f3a2e] text-white font-medium text-sm px-4 py-2 rounded-md hover:bg-[#162a21]"
        >
          Create Punch List →
        </button>
      </article>

      <article className="bg-[#f5efe2] border border-[#e8e3d4] rounded-xl p-6">
        <div className="text-xs uppercase tracking-wide text-[#1a1f1a]/60 mb-2">Project Grew?</div>
        <h3 className="font-display text-xl text-[#1f3a2e] mb-2">Get expert guidance</h3>
        <p className="text-sm text-[#1a1f1a]/85 mb-4">Scope changed since you bought the plan? Tell us what changed.</p>
        <button
          type="button"
          onClick={onGrewClick}
          className="bg-[#1f3a2e] text-white font-medium text-sm px-4 py-2 rounded-md hover:bg-[#162a21]"
        >
          Ask Alder →
        </button>
      </article>
    </section>
  )
}

function MovesTable({
  plan,
  visiblePaths,
  activePathId,
  onSwitchPath,
  movesForPath,
  savedIds,
  onToggleSaved,
  onDismiss,
}: {
  plan: WorthItOutput
  visiblePaths: WorthItOutput['planPaths']
  activePathId: string
  onSwitchPath: (id: string) => void
  movesForPath: Move[]
  savedIds: string[]
  onToggleSaved: (id: string) => void
  onDismiss: (id: string) => void
}) {
  void plan
  return (
    <section className="bg-white border border-[#e8e3d4] rounded-xl mb-6">
      <div className="px-6 pt-6 pb-2">
        <h2 className="font-display text-2xl text-[#1a1f1a] mb-1">Your highest-payoff moves</h2>
      </div>
      <div className="px-6 border-b border-[#e8e3d4] flex flex-wrap gap-1">
        {visiblePaths.map(p => (
          <button
            key={p.id}
            onClick={() => onSwitchPath(p.id)}
            className={`text-sm px-3 py-2 rounded-t-md ${
              p.id === activePathId
                ? 'bg-[#fbf8f1] text-[#1f3a2e] font-medium border-x border-t border-[#e8e3d4]'
                : 'text-[#1a1f1a]/65 hover:text-[#1a1f1a]'
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead className="text-left text-xs uppercase tracking-wide text-[#1a1f1a]/55 bg-[#fbf8f1]">
            <tr>
              <th className="py-3 px-6">Move</th>
              <th className="py-3 px-3">Impact</th>
              <th className="py-3 px-3">Spend</th>
              <th className="py-3 px-3">Time</th>
              <th className="py-3 px-3">Score</th>
              <th className="py-3 px-3 text-right">Action</th>
              <th className="py-3 px-6 w-10"></th>
            </tr>
          </thead>
          <tbody>
            {movesForPath.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 px-6 text-center text-[#1a1f1a]/55 italic">
                  No moves on this path. Try a different tab.
                </td>
              </tr>
            )}
            {movesForPath.map(move => {
              const saved = savedIds.includes(move.id)
              return (
                <tr key={move.id} className="border-t border-[#e8e3d4]">
                  <td className="py-3 px-6">
                    <div className="font-medium text-[#1a1f1a]">{move.title}</div>
                    <div className="text-xs text-[#1a1f1a]/65">{move.whyRanked}</div>
                  </td>
                  <td className="py-3 px-3 capitalize">{move.impactLevel}</td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    ${move.spend.low}{move.spend.low !== move.spend.high && `–$${move.spend.high}`}
                  </td>
                  <td className="py-3 px-3 whitespace-nowrap">
                    {move.timeMinutes < 60 ? `${move.timeMinutes} min` : `${Math.round(move.timeMinutes / 60)} hr`}
                  </td>
                  <td className="py-3 px-3">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs">{move.score}</span>
                      <span className="w-12 h-1.5 bg-[#e8e3d4] rounded-full overflow-hidden">
                        <span className="block h-full bg-[#1f3a2e]" style={{ width: `${move.score}%` }} />
                      </span>
                    </div>
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => onToggleSaved(move.id)}
                        className={`text-xs px-3 py-1.5 rounded-md border ${
                          saved
                            ? 'bg-[#1f3a2e] text-white border-[#1f3a2e]'
                            : 'border-[#e8e3d4] hover:bg-[#fbf8f1]'
                        }`}
                      >
                        {saved ? 'Added' : 'Add to plan'}
                      </button>
                      <button
                        type="button"
                        onClick={() => onDismiss(move.id)}
                        title="Not relevant — hide this move"
                        aria-label="Not relevant"
                        className="text-xs text-[#1a1f1a]/45 hover:text-[#a44e2c] px-2 py-1.5 rounded-md"
                      >
                        ×
                      </button>
                    </div>
                  </td>
                  <td className="py-3 px-6 text-[#1a1f1a]/40">
                    <BookmarkIcon filled={saved} />
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function SupportingCards({
  plan,
  onSkipList,
  onDiyStopLine,
  onComparePaths,
  onStartChecklist,
}: {
  plan: WorthItOutput
  onSkipList: () => void
  onDiyStopLine: () => void
  onComparePaths: () => void
  onStartChecklist: () => void
}) {
  return (
    <section className="grid md:grid-cols-5 gap-4 mb-6">
      <Card
        title="What to Buy"
        subtitle={`${plan.whatToBuy.length} items in your shopping list`}
        actionLabel="View Shopping List"
        actionHref={`/api/plan/${plan.planCode}/shopping-list`}
        preview={plan.whatToBuy.slice(0, 4).map(i => i.display)}
      />
      <Card
        title="This Saturday"
        subtitle={`${plan.thisSaturday.length} tasks · 3-4 hrs`}
        actionLabel="Start checklist"
        onAction={onStartChecklist}
        preview={plan.thisSaturday.slice(0, 4).map(m => m.title)}
      />
      <Card
        title="What to Skip"
        subtitle={`${plan.whatToSkip.length} items`}
        actionLabel="View Skip List"
        onAction={onSkipList}
        preview={plan.whatToSkip.slice(0, 4).map(s => s.title)}
      />
      <Card
        title="DIY Stop Line"
        subtitle="Know when to call a pro"
        actionLabel="Learn more"
        onAction={onDiyStopLine}
        preview={plan.diyStopLine.slice(0, 4).map(s => s.trigger)}
      />
      <Card
        title="Plan Paths"
        subtitle=""
        actionLabel="Compare paths"
        onAction={onComparePaths}
        preview={plan.planPaths.map(p => p.label)}
      />
    </section>
  )
}

function Card({
  title,
  subtitle,
  preview,
  actionLabel,
  actionHref,
  onAction,
}: {
  title: string
  subtitle: string
  preview: string[]
  actionLabel: string
  actionHref?: string
  onAction?: () => void
}) {
  return (
    <article className="bg-white border border-[#e8e3d4] rounded-xl p-4 flex flex-col">
      <h3 className="font-display text-base text-[#1f3a2e] mb-1">{title}</h3>
      {subtitle && <p className="text-xs text-[#1a1f1a]/60 mb-3">{subtitle}</p>}
      <ul className="text-xs text-[#1a1f1a]/85 space-y-1 mb-4 flex-1">
        {preview.map(p => (
          <li key={p} className="truncate">• {p}</li>
        ))}
      </ul>
      {actionHref ? (
        <a href={actionHref} className="text-xs text-[#1f3a2e] underline-offset-2 hover:underline">
          {actionLabel} →
        </a>
      ) : onAction ? (
        <button
          type="button"
          onClick={onAction}
          className="text-xs text-[#1f3a2e] underline-offset-2 hover:underline text-left"
        >
          {actionLabel} →
        </button>
      ) : (
        <span className="text-xs text-[#1f3a2e]/60">{actionLabel} →</span>
      )}
    </article>
  )
}

function SummaryBar({ plan }: { plan: WorthItOutput }) {
  const totalTimeLabel =
    plan.summary.totalTimeHours.low === plan.summary.totalTimeHours.high
      ? `${plan.summary.totalTimeHours.low} hrs`
      : `${plan.summary.totalTimeHours.low}–${plan.summary.totalTimeHours.high} hrs`
  const numericScore =
    plan.worthItScore === 'Strong' ? 9.1 : plan.worthItScore === 'Moderate' ? 7.4 : 5.6
  const showSubLabel = numericScore >= 6.0
  return (
    <section className="bg-[#f5efe2] border border-[#e8e3d4] rounded-xl p-6 mb-6 grid md:grid-cols-5 gap-4 text-sm text-center">
      <Stat label="Est. Spend" value={`$${plan.summary.estSpend.low}–$${plan.summary.estSpend.high}`} />
      <Stat label="Total Time" value={totalTimeLabel} />
      <Stat label="Comfort Payoff" value={plan.summary.comfortLift} />
      <Stat label="Confidence" value={plan.summary.confidence} />
      <Stat
        label="Project Complexity"
        value={`${numericScore.toFixed(1)} / 10`}
        sub={showSubLabel ? plan.worthItScore : undefined}
      />
    </section>
  )
}

function Stat({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div>
      <div className="text-xs uppercase tracking-wide text-[#1a1f1a]/55 mb-1">{label}</div>
      <div className="font-display text-2xl text-[#1f3a2e]">{value}</div>
      {sub && <div className="text-xs text-[#1a1f1a]/65 mt-1">{sub}</div>}
    </div>
  )
}

function ActionBar({
  plan,
  state,
  onStartChecklist,
  onShare,
  onDownload,
  onToggleReminder,
}: {
  plan: WorthItOutput
  state: PlanState
  onStartChecklist: () => void
  onShare: () => void
  onDownload: () => void
  onToggleReminder: (id: keyof PlanState['reminderPreferences']) => void
}) {
  void plan
  return (
    <section className="bg-white border border-[#e8e3d4] rounded-xl p-6 grid md:grid-cols-2 gap-6">
      <div className="flex flex-wrap gap-3">
        <button
          type="button"
          onClick={onStartChecklist}
          className="bg-[#1f3a2e] hover:bg-[#162a21] text-white font-medium px-5 py-2.5 rounded-md text-sm"
        >
          Start checklist
        </button>
        <button
          type="button"
          onClick={onShare}
          className="border border-[#e8e3d4] hover:bg-[#fbf8f1] px-4 py-2.5 rounded-md text-sm"
        >
          Share plan
        </button>
        <button
          type="button"
          onClick={onDownload}
          className="border border-[#e8e3d4] hover:bg-[#fbf8f1] px-4 py-2.5 rounded-md text-sm"
        >
          Download PDF
        </button>
      </div>

      <div>
        <div className="text-xs uppercase tracking-wide text-[#1a1f1a]/55 mb-3">
          Optional reminders (no account needed)
        </div>
        <div className="flex flex-wrap gap-4 text-sm">
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.reminderPreferences.friday}
              onChange={() => onToggleReminder('friday')}
            />
            Remind me Friday
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.reminderPreferences.saturday_morning}
              onChange={() => onToggleReminder('saturday_morning')}
            />
            Saturday morning
          </label>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={state.reminderPreferences.sunday_followup}
              onChange={() => onToggleReminder('sunday_followup')}
            />
            Follow up Sunday
          </label>
        </div>
      </div>
    </section>
  )
}

// ============== Tiny presentational helpers ==========================

function Toast({ text }: { text: string }) {
  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 bg-[#1a1f1a] text-white text-sm px-4 py-2 rounded-md shadow-lg z-50">
      {text}
    </div>
  )
}

function BookmarkIcon({ filled }: { filled: boolean }) {
  return (
    <svg viewBox="0 0 16 16" fill={filled ? 'currentColor' : 'none'} stroke="currentColor" className="w-4 h-4">
      <path d="M3 2a1 1 0 011-1h8a1 1 0 011 1v13l-5-3-5 3V2z" />
    </svg>
  )
}

function PinIcon() {
  return (
    <svg viewBox="0 0 16 16" fill="currentColor" className="w-4 h-4">
      <path d="M8 0a5 5 0 015 5c0 4-5 11-5 11S3 9 3 5a5 5 0 015-5zm0 7a2 2 0 100-4 2 2 0 000 4z" />
    </svg>
  )
}

function labelForTopic(topic: string): string {
  switch (topic) {
    case 'kitchen': return 'Kitchen Refresh'
    case 'weatherization': return 'DIY Weatherization'
    case 'outdoor': return 'Outdoor Project'
    case 'heat_pump': return 'Heat Pump Readiness'
    case 'bath': return 'Bath Project'
    default: return 'Vermont Project'
  }
}
