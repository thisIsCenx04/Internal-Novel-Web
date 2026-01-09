import { useQuery } from '@tanstack/react-query'
import { fetchMemberSettings } from '../api/settingsApi'

export function RulesBanner() {
  const { data } = useQuery({
    queryKey: ['member-settings'],
    queryFn: fetchMemberSettings,
  })

  if (!data?.rulesBannerText) return null

  return (
    <div className="rules-banner">
      <p>{data.rulesBannerText}</p>
    </div>
  )
}
