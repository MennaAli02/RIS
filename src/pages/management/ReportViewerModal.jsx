import { useState } from 'react'
import StatusBar from '../../components/ui/StatusBar'
import { REPORT_STATE_OPTIONS } from '../../data/seed'

// Stand-in for the secondary "operation_wizard_form_reg" form view: a report
// review popup with the report_state statusbar and the Partial / Not Verified
// / Verify workflow buttons.
export default function ReportViewerModal({ record, onChange, onClose }) {
  const [summary, setSummary] = useState(record.summary || '')

  const setReportState = (value) => onChange({ reportState: value })

  const handlePartial = () => {
    onChange({ reportState: 'partial', pApproved: true })
  }
  const handleNotVerified = () => {
    onChange({ reportState: 'not_verified', nApproved: true })
  }
  const handleVerify = () => {
    onChange({ reportState: 'verified', allApproved: true })
  }
  const handleSaveSummary = () => {
    onChange({ summary })
  }

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
      <div className="bg-amber-50 rounded-xl shadow-2xl w-full max-w-3xl max-h-[86vh] overflow-y-auto">
        <div className="flex items-center justify-between px-5 py-4 border-b border-amber-200">
          <StatusBar options={REPORT_STATE_OPTIONS} value={record.reportState} onChange={setReportState} />
          <button onClick={onClose} className="text-gray-500 hover:text-gray-800 text-xl leading-none px-2">
            ×
          </button>
        </div>

        <div className="p-5 space-y-4">
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handlePartial}
              disabled={record.pApproved}
              className="bg-brand-500 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-md"
            >
              Partial
            </button>
            <button
              type="button"
              onClick={handleNotVerified}
              disabled={record.nApproved}
              className="bg-brand-500 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-md"
            >
              Not Verified
            </button>
            <button
              type="button"
              onClick={handleVerify}
              disabled={record.allApproved}
              className="bg-brand-500 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-md"
            >
              Verify
            </button>
            <button
              type="button"
              disabled={!summary}
              onClick={() => window.print()}
              className="bg-gray-700 disabled:opacity-40 text-white text-sm font-semibold px-4 py-2 rounded-md ml-auto"
            >
              Print
            </button>
          </div>

          <div>
            <label className="field-label">Report Summary</label>
            <textarea
              className="field-input"
              rows={10}
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              placeholder="Report findings / conclusion..."
            />
            <button
              type="button"
              onClick={handleSaveSummary}
              className="mt-2 bg-brand-700 text-white text-sm font-semibold px-4 py-2 rounded-md"
            >
              Save Summary
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
