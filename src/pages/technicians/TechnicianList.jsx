import { useNavigate } from 'react-router-dom'
import { useData } from '../../data/DataContext'
import DataTable from '../../components/ui/DataTable'

export default function TechnicianList() {
  const navigate = useNavigate()
  const { getAll } = useData()
  const technicians = getAll('technicians')

  const columns = [
    { key: 'partnerName', label: 'Name' },
    { key: 'specialization', label: 'Specialization' },
    { key: 'degree', label: 'Degree' },
    { key: 'phone', label: 'Phone' },
    { key: 'email', label: 'Email' },
  ]

  return (
    <DataTable
      title="Technicians"
      columns={columns}
      rows={technicians}
      searchKeys={['partnerName', 'specialization', 'phone', 'email']}
      onRowClick={(row) => navigate(`/technicians/${row.id}`)}
      onCreate={() => navigate('/technicians/new')}
    />
  )
}
