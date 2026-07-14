import TrailProgress from '../ui/TrailProgress'
import { CheckIcon, PlayCircleIcon, DocumentIcon, NoteIcon } from '../ui/Icons'
import type { Section, Lecture } from '../../services/courseService'

interface Props {
  sections: Section[]
  completedIds: Set<string>
  progress: number
  /** Currently open lecture (course player). Omit on the course detail page. */
  activeLectureId?: string
  /** Called when a lecture row is clicked — navigate to it (detail page) or open it in-place (player). */
  onSelectLecture: (lecture: Lecture) => void
  className?: string
}

/**
 * The "which section is done, which is in progress" tracker — same visual
 * language on both the lecture player's sidebar and the course detail page,
 * so a student sees one consistent map of their progress everywhere.
 */
export default function CurriculumTracker({
  sections,
  completedIds,
  progress,
  activeLectureId,
  onSelectLecture,
  className = '',
}: Props) {
  const totalCount = sections.reduce((n, s) => n + s.lectures.length, 0)

  return (
    <div className={className}>
      <div className="flex items-center justify-between text-small mb-1.5">
        <span className="text-ink-muted">Your progress</span>
        <span className="text-trail-green font-mono text-micro">{progress}%</span>
      </div>
      <TrailProgress progress={progress} size="mini" completedCount={completedIds.size} totalCount={totalCount} />
      <p className="text-micro text-ink-muted mt-1.5 mb-3">{completedIds.size}/{totalCount} lectures done</p>

      <div className="max-h-[420px] overflow-y-auto -mx-1 px-1">
        {sections.map((section, sectionIdx) => (
          <div key={section._id} className="mb-3 last:mb-0">
            <p className="text-micro font-semibold text-ink-muted uppercase tracking-widest mb-0.5">
              Section {sectionIdx + 1}
            </p>
            <p className="text-small font-medium text-ink-primary leading-snug mb-1">{section.title}</p>

            <div className="pl-1">
              {section.lectures.map((lec, lecIdx) => {
                const isActive = activeLectureId === lec._id
                const isDone = completedIds.has(lec._id)
                const isLast = lecIdx === section.lectures.length - 1
                const TypeIcon = lec.type === 'video' ? PlayCircleIcon : lec.type === 'pdf' ? DocumentIcon : NoteIcon

                return (
                  <button
                    key={lec._id}
                    onClick={() => onSelectLecture(lec)}
                    className="flex w-full text-left gap-0 group"
                  >
                    {/* Timeline column */}
                    <div className="flex flex-col items-center mr-2.5 shrink-0" style={{ width: 18 }}>
                      <div
                        className={`w-4.5 h-4.5 w-[18px] h-[18px] rounded-full flex items-center justify-center shrink-0 z-10 border-2 ${
                          isDone
                            ? 'bg-trail-green border-trail-green'
                            : isActive
                            ? 'bg-bg-surface border-trail-green'
                            : 'bg-bg-surface border-border-color'
                        }`}
                      >
                        {isDone ? (
                          <CheckIcon className="w-2.5 h-2.5 text-white" strokeWidth={3} />
                        ) : (
                          <div className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-trail-green' : 'bg-border-color'}`} />
                        )}
                      </div>
                      {!isLast && (
                        <div className={`w-0.5 flex-1 mt-0.5 min-h-4 ${isDone ? 'bg-trail-green/30' : 'bg-border-color'}`} />
                      )}
                    </div>

                    {/* Lecture label */}
                    <div className={`flex-1 min-w-0 pb-3 rounded-btn px-2 -mt-0.5 transition-colors ${
                      isActive ? 'bg-trail-green/8' : 'group-hover:bg-bg-surface-alt'
                    }`}>
                      <div className="flex items-start gap-1.5 pt-0.5">
                        <TypeIcon className={`w-3.5 h-3.5 mt-0.5 shrink-0 ${isDone ? 'text-trail-green' : 'text-ink-muted'}`} />
                        <span className={`text-small leading-snug ${
                          isActive ? 'text-trail-green font-medium' : isDone ? 'text-ink-muted' : 'text-ink-primary'
                        }`}>
                          {lec.title}
                        </span>
                      </div>
                    </div>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
