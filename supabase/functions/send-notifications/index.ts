// Supabase Edge Function to send email notifications
// Deploy with: supabase functions deploy send-notifications

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') || ''
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || ''

interface NotificationData {
  user_id: string
  subscription_id?: string
  service_id?: string
  notification_type: 'payment_reminder' | 'service_changed' | 'service_discontinued' | 'subscription_added' | 'subscription_deleted' | 'subscription_updated'
  email: string
  subject: string
  metadata?: Record<string, any>
  language?: string
}

const emailTemplates = {
  payment_reminder: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">SubManager</h1>
      </div>

      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1a1a1a; margin-top: 0;">Напоминание о предстоящем списании</h2>

        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Здравствуйте! Напоминаем, что завтра ${data.next_billing} произойдёт списание средств по подписке:
        </p>

        <div style="background: white; border-left: 4px solid #fb923c; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">${data.subscription_name}</h3>
          <p style="margin: 5px 0; color: #6b7280;"><strong>Сумма:</strong> ${data.price} ${data.currency || 'RUB'}</p>
          <p style="margin: 5px 0; color: #6b7280;"><strong>Период:</strong> ${data.billing_cycle === 'monthly' ? 'Месяц' : 'Год'}</p>
          <p style="margin: 5px 0; color: #6b7280;"><strong>Дата списания:</strong> ${data.next_billing}</p>
        </div>

        <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">
          Убедитесь, что на вашем счёте достаточно средств для оплаты подписки.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${SUPABASE_URL.replace('supabase.co', 'makeproxy-c.figma.site')}"
             style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Открыть SubManager
          </a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>Это автоматическое уведомление от SubManager</p>
        <p>Вы получили это письмо, потому что у вас включены уведомления о предстоящих списаниях</p>
      </div>
    </div>
  `,

  service_changed: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">SubManager</h1>
      </div>

      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1a1a1a; margin-top: 0;">Изменения в подписке</h2>

        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Уведомляем вас об изменениях в сервисе <strong>${data.service_name}</strong>:
        </p>

        <div style="background: #fef3c7; border-left: 4px solid #f59e0b; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #92400e;">⚠️ Обновлены тарифы и условия</h3>
          <p style="margin: 5px 0; color: #78350f;">
            Сервис обновил свои тарифные планы. Это может повлиять на стоимость вашей подписки.
          </p>
        </div>

        <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">
          Рекомендуем проверить текущие условия вашей подписки в личном кабинете.
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${SUPABASE_URL.replace('supabase.co', 'makeproxy-c.figma.site')}"
             style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Проверить подписку
          </a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>Это автоматическое уведомление от SubManager</p>
        <p>Вы получили это письмо, потому что у вас включены уведомления об изменениях ��ервисов</p>
      </div>
    </div>
  `,

  service_discontinued: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">SubManager</h1>
      </div>

      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1a1a1a; margin-top: 0;">Прекращение работы сервиса</h2>

        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          К сожалению, сервис <strong>${data.service_name}</strong> прекратил свою работу.
        </p>

        <div style="background: #fee2e2; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #991b1b;">🚫 Сервис больше недоступен</h3>
          <p style="margin: 5px 0; color: #7f1d1d;">
            Ваша подписка на ${data.service_name} будет автоматически удалена из SubManager.
          </p>
        </div>

        <p style="color: #4b5563; font-size: 14px; margin-top: 30px;">
          ${data.message || 'Мы рекоменду��м найти альтернативный сервис в каталоге SubManager.'}
        </p>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${SUPABASE_URL.replace('supabase.co', 'makeproxy-c.figma.site')}"
             style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Найти альтернативу
          </a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>Это автоматическое уведомление от SubManager</p>
        <p>Вы получили это письмо, потому что у вас включены уведомления о прекращении работы сервисов</p>
      </div>
    </div>
  `,

  subscription_added: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">SubManager</h1>
      </div>

      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1a1a1a; margin-top: 0;">✅ Новая подписка добавлена</h2>

        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Вы успешно добавили подписку в SubManager:
        </p>

        <div style="background: white; border-left: 4px solid #10b981; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">${data.subscription_name}</h3>
          <p style="margin: 5px 0; color: #6b7280;"><strong>Сумма:</strong> ${data.price} ${data.currency || 'RUB'}</p>
          <p style="margin: 5px 0; color: #6b7280;"><strong>Период:</strong> ${data.billing_cycle === 'monthly' ? 'Месяц' : 'Год'}</p>
          <p style="margin: 5px 0; color: #6b7280;"><strong>Следующее списание:</strong> ${data.next_billing}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${SUPABASE_URL.replace('supabase.co', 'makeproxy-c.figma.site')}"
             style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Открыть SubManager
          </a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>Это автоматическое уведомление от SubManager</p>
      </div>
    </div>
  `,

  subscription_deleted: (data: any) => `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <div style="background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
        <h1 style="color: white; margin: 0;">SubManager</h1>
      </div>

      <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
        <h2 style="color: #1a1a1a; margin-top: 0;">🗑️ Подписка удалена</h2>

        <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
          Вы удалили подписку из SubManager:
        </p>

        <div style="background: white; border-left: 4px solid #ef4444; padding: 20px; margin: 20px 0; border-radius: 5px;">
          <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">${data.subscription_name}</h3>
          <p style="margin: 5px 0; color: #6b7280;"><strong>Сумма:</strong> ${data.price} ${data.currency || 'RUB'}</p>
          <p style="margin: 5px 0; color: #6b7280;"><strong>Период:</strong> ${data.billing_cycle === 'monthly' ? 'Месяц' : 'Год'}</p>
        </div>

        <div style="text-align: center; margin-top: 30px;">
          <a href="${SUPABASE_URL.replace('supabase.co', 'makeproxy-c.figma.site')}"
             style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
            Открыть SubManager
          </a>
        </div>
      </div>

      <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
        <p>Это автоматическое уведомление от SubManager</p>
      </div>
    </div>
  `,

  subscription_updated: (data: any) => {
    let changesHtml = '';
    if (data.changes && Object.keys(data.changes).length > 0) {
      changesHtml = '<ul style="margin: 10px 0; padding-left: 20px; color: #6b7280;">';
      for (const [key, value] of Object.entries(data.changes)) {
        const labels: Record<string, string> = {
          price: 'Цена',
          billing_cycle: 'Период оплаты',
          next_billing: 'Дата списания',
          name: 'Название'
        };
        const label = labels[key] || key;
        changesHtml += `<li><strong>${label}:</strong> ${(value as any).old} → ${(value as any).new}</li>`;
      }
      changesHtml += '</ul>';
    }

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
        <div style="background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); padding: 30px; border-radius: 10px 10px 0 0;">
          <h1 style="color: white; margin: 0;">SubManager</h1>
        </div>

        <div style="background: #f9fafb; padding: 30px; border-radius: 0 0 10px 10px;">
          <h2 style="color: #1a1a1a; margin-top: 0;">🔄 Настройки подписки изменены</h2>

          <p style="color: #4b5563; font-size: 16px; line-height: 1.6;">
            Вы изменили настройки подписки <strong>${data.subscription_name}</strong>:
          </p>

          <div style="background: white; border-left: 4px solid #3b82f6; padding: 20px; margin: 20px 0; border-radius: 5px;">
            <h3 style="margin: 0 0 10px 0; color: #1a1a1a;">Изменения:</h3>
            ${changesHtml}
          </div>

          <div style="text-align: center; margin-top: 30px;">
            <a href="${SUPABASE_URL.replace('supabase.co', 'makeproxy-c.figma.site')}"
               style="display: inline-block; background: linear-gradient(135deg, #fb923c 0%, #8b5cf6 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
              Открыть SubManager
            </a>
          </div>
        </div>

        <div style="text-align: center; padding: 20px; color: #9ca3af; font-size: 12px;">
          <p>Это автоматическое уведомление от SubManager</p>
        </div>
      </div>
    `;
  },
}

async function sendEmail(to: string, subject: string, html: string): Promise<boolean> {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${RESEND_API_KEY}`,
      },
      body: JSON.stringify({
        from: 'SubManager <notifications@submanager.app>',
        to: [to],
        subject: subject,
        html: html,
      }),
    })

    if (!response.ok) {
      const error = await response.text()
      console.error('Resend API error:', error)
      return false
    }

    const data = await response.json()
    console.log('Email sent successfully:', data)
    return true
  } catch (error) {
    console.error('Error sending email:', error)
    return false
  }
}

serve(async (req) => {
  try {
    // CORS headers
    if (req.method === 'OPTIONS') {
      return new Response('ok', {
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
        },
      })
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY)

    // Check for scheduled payment reminders
    if (req.method === 'POST' && new URL(req.url).pathname === '/check-payment-reminders') {
      const { data: upcomingPayments, error } = await supabase
        .rpc('get_subscriptions_needing_payment_notification')

      if (error) {
        console.error('Error getting upcoming payments:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      let sentCount = 0
      let failedCount = 0

      for (const payment of upcomingPayments || []) {
        const template = emailTemplates.payment_reminder({
          subscription_name: payment.subscription_name,
          price: payment.price,
          billing_cycle: payment.billing_cycle,
          next_billing: payment.next_billing,
          currency: 'RUB',
        })

        const success = await sendEmail(
          payment.user_email,
          `Напоминание: списание ${payment.price} RUB завтра`,
          template
        )

        if (success) {
          // Mark notification as sent
          await supabase.rpc('mark_notification_sent', {
            p_user_id: payment.user_id,
            p_subscription_id: payment.subscription_id,
            p_notification_type: 'payment_reminder',
            p_email: payment.user_email,
            p_subject: `Напоминание: списание ${payment.price} RUB завтра`,
            p_metadata: { next_billing_date: payment.next_billing },
          })
          sentCount++
        } else {
          failedCount++
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          sent: sentCount,
          failed: failedCount,
          total: (upcomingPayments || []).length,
        }),
        {
          headers: { 'Content-Type': 'application/json' },
        }
      )
    }

    // Send pending notifications (triggered by database changes)
    if (req.method === 'POST' && new URL(req.url).pathname === '/send-pending') {
      const { data: pendingNotifications, error } = await supabase
        .from('notification_logs')
        .select('*')
        .is('sent_at', null)
        .limit(100)

      if (error) {
        console.error('Error getting pending notifications:', error)
        return new Response(JSON.stringify({ error: error.message }), { status: 500 })
      }

      let sentCount = 0

      for (const notification of pendingNotifications || []) {
        const templateFn = emailTemplates[notification.notification_type as keyof typeof emailTemplates]
        if (!templateFn) continue

        const html = templateFn(notification.metadata || {})
        const success = await sendEmail(notification.email, notification.subject, html)

        if (success) {
          // Update sent_at timestamp
          await supabase
            .from('notification_logs')
            .update({ sent_at: new Date().toISOString() })
            .eq('id', notification.id)

          sentCount++
        }
      }

      return new Response(
        JSON.stringify({ success: true, sent: sentCount }),
        { headers: { 'Content-Type': 'application/json' } }
      )
    }

    return new Response(
      JSON.stringify({ error: 'Invalid endpoint' }),
      { status: 400, headers: { 'Content-Type': 'application/json' } }
    )
  } catch (error) {
    console.error('Function error:', error)
    return new Response(
      JSON.stringify({ error: (error as Error).message }),
      { status: 500, headers: { 'Content-Type': 'application/json' } }
    )
  }
})