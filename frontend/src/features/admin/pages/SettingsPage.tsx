import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '../../../shared/components/Button'
import { fetchSettings, updateSettings, type SettingsPayload } from '../api/adminApi'

const defaultState: SettingsPayload = {
  rulesBannerText: '',
  footerContactText: '',
  singleSessionPolicy: 'KICK_OLD',
}

export function SettingsPage() {
  const { data, isLoading } = useQuery({
    queryKey: ['admin-settings'],
    queryFn: fetchSettings,
  })
  const [form, setForm] = useState<SettingsPayload>(defaultState)

  useEffect(() => {
    if (data) setForm(data)
  }, [data])

  const mutation = useMutation({
    mutationFn: updateSettings,
  })

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault()
    mutation.mutate(form)
  }

  return (
    <section className="stack">
      <h2>Settings</h2>
      <form className="card form" onSubmit={handleSubmit}>
        <label className="field">
          Rules banner text
          <textarea
            value={form.rulesBannerText}
            rows={3}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, rulesBannerText: event.target.value }))
            }
          />
        </label>
        <label className="field">
          Footer contact text
          <textarea
            value={form.footerContactText}
            rows={2}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, footerContactText: event.target.value }))
            }
          />
        </label>
        <label className="field">
          Single session policy
          <select
            value={form.singleSessionPolicy}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                singleSessionPolicy: event.target.value as SettingsPayload['singleSessionPolicy'],
              }))
            }
          >
            <option value="KICK_OLD">KICK_OLD</option>
            <option value="DENY_NEW">DENY_NEW</option>
          </select>
        </label>
        <div className="actions">
          <Button type="submit" disabled={isLoading || mutation.isPending}>
            {mutation.isPending ? 'Saving...' : 'Save settings'}
          </Button>
        </div>
        {mutation.isSuccess ? <p className="muted">Saved.</p> : null}
      </form>
    </section>
  )
}
