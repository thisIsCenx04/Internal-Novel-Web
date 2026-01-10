import { useEffect, useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { Button } from '../../../shared/components/Button'
import { fetchSettings, updateSettings, type SettingsPayload } from '../api/adminApi'

const defaultState: SettingsPayload = {
  rulesBannerText: '',
  footerContactText: '',
  singleSessionPolicy: 'KICK_OLD',
  watermarkEnabled: true,
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
      <h2>Cài đặt trang web</h2>
      <form className="card form" onSubmit={handleSubmit}>
        <label className="field">
          Quy định (Hiển thị ở banner đầu trang)
          <textarea
            value={form.rulesBannerText}
            rows={3}
            maxLength={1000}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, rulesBannerText: event.target.value }))
            }
          />
        </label>
        <label className="field">
          Thông tin liên lạc ở cuối trang
          <textarea
            value={form.footerContactText}
            rows={2}
            onChange={(event) =>
              setForm((prev) => ({ ...prev, footerContactText: event.target.value }))
            }
          />
        </label>
        <label className="field">
          Phương thức hoạt động
          <select
            value={form.singleSessionPolicy}
            onChange={(event) =>
              setForm((prev) => ({
                ...prev,
                singleSessionPolicy: event.target.value as SettingsPayload['singleSessionPolicy'],
              }))
            }
          >
            <option value="KICK_OLD">Đăng xuất khỏi thiết bị cũ</option>
            <option value="DENY_NEW">Từ chối nhập ở thiết bị mới</option>
          </select>
        </label>
        <label className="field">
          <span>Reader watermark</span>
          <div className="inline-field">
            <input
              type="checkbox"
              checked={form.watermarkEnabled}
              onChange={(event) =>
                setForm((prev) => ({ ...prev, watermarkEnabled: event.target.checked }))
              }
            />
            <span>Watermark</span>
          </div>
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
