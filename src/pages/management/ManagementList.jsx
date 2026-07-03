import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useData } from '../../data/DataContext'
import DataTable from '../../components/ui/DataTable'
import Badge from '../../components/ui/Badge'
import { REPORT_STATE_OPTIONS } from '../../data/seed'
import { formatDateTime } from '../../lib/utils'
import ReportViewerModal from './ReportViewerModal'

const REPORT_BADGE_COLOR = { partial: 'danger', not_verified: 'info', verified: 'success', approved: 'success' }

export default function ManagementList() {
  const navigate = useNavigate()
  const { getAll, update } = useData()
  const [viewerId, setViewerId] = useState(null)

  const records = getAll('managements')
  const patients = getAll('patients')
  const doctors = getAll('doctors')
  const machines = getAll('machines')
  const products = getAll('products')
  const users = getAll('users')
  const reportTemplates = getAll('reportTemplates')

  const nameOf = (list, id) => list.find((r) => r.id === id)?.name ?? list.find((r) => r.id === id)?.nickname ?? list.find((r) => r.id === id)?.partnerName ?? '—'

  const rows = records.map((r) => ({
    ...r,
    _patient: patients.find((p) => p.id === r.patientId)?.nickname ?? '—',
    _pid: patients.find((p) => p.id === r.patientId)?.pid ?? '—',
    _machine: nameOf(machines, r.machineId),
    _product: nameOf(products, r.cashProductId),
    _doctor: nameOf(doctors, r.doctorId),
    _assignedDoctor: nameOf(doctors, r.assignedDoctorId),
    _createUid: nameOf(users, r.createUid),
    _template: nameOf(reportTemplates, r.reportTemplateId),
  }))

  const reportStateLabel = (value) => REPORT_STATE_OPTIONS.find((o) => o.value === value)?.label ?? value

  const columns = [
    { key: '_pid', label: 'PID' },
    { key: '_patient', label: 'Patient' },
    { key: '_machine', label: 'Machine' },
    { key: '_product', label: 'Procedure' },
    { key: 'accession', label: 'Accession' },
    { key: '_doctor', label: 'Referral Doctor' },
    { key: '_assignedDoctor', label: 'Assigned Doctor' },
    { key: 'examDate', label: 'Exam Date', render: (row) => formatDateTime(row.examDate) },
    {
      key: 'reportState',
      label: 'Report Status',
      render: (row) => <Badge text={reportStateLabel(row.reportState)} color={REPORT_BADGE_COLOR[row.reportState]} />,
    },
    { key: 'reportDurationDisplay', label: 'Report Duration' },
    { key: '_template', label: 'Template' },
    {
      key: '_actions',
      label: 'Report',
      render: (row) => (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation()
            setViewerId(row.id)
          }}
          className="bg-brand-500 hover:bg-brand-700 text-white text-xs font-semibold px-3 py-1.5 rounded-md"
        >
          Report
        </button>
      ),
    },
    { key: '_createUid', label: 'Created By' },
  ]

  const viewerRecord = records.find((r) => r.id === viewerId)

  return (
    <>
      <DataTable
        title="WorkList"
        columns={columns}
        rows={rows}
        searchKeys={['_patient', '_pid', 'accession']}
        onRowClick={(row) => navigate(`/management/${row.id}`)}
      />
      {viewerRecord && (
        <ReportViewerModal
          record={viewerRecord}
          onChange={(vals) => update('managements', viewerRecord.id, vals)}
          onClose={() => setViewerId(null)}
        />
      )}
    </>
  )
}
