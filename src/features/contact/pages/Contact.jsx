import { useState } from 'react'
import { motion } from 'framer-motion'
import { Mail, MapPin, Send, MessageCircle, Clock } from 'lucide-react'
// FEATURE: CONTACT — contact form with sent state
import Footer from '@components/layout/Footer'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 pt-20">
      <div className="bg-gradient-to-r from-sky-600 via-blue-600 to-indigo-600 py-16">
        <div className="section-container text-white text-center">
          <motion.h1 initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="font-display text-4xl sm:text-5xl font-bold mb-3">Get in Touch</motion.h1>
          <p className="text-white/80 text-lg">We'd love to hear from you — questions, feedback, or just to say hi</p>
        </div>
      </div>

      <div className="section-container py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {/* Info */}
          <div className="space-y-5">
            {[
              { icon: Mail, title: 'Email Us', sub: 'hello@travelbudget.com', desc: 'We reply within 24 hours' },
              { icon: MessageCircle, title: 'Live Chat', sub: 'Available in-app', desc: 'Mon–Fri 9am–6pm UTC' },
              { icon: Clock, title: 'Response Time', sub: 'Under 24 hours', desc: 'For all inquiries' },
              { icon: MapPin, title: 'Location', sub: 'Remote — Worldwide', desc: 'Distributed team across 5 continents' },
            ].map(({ icon: Icon, title, sub, desc }) => (
              <div key={title} className="flex items-start gap-4 bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-100 dark:border-slate-700 shadow-card">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-purple-500 flex items-center justify-center flex-shrink-0">
                  <Icon size={18} className="text-white" />
                </div>
                <div>
                  <p className="font-bold text-slate-900 dark:text-white text-sm">{title}</p>
                  <p className="text-brand-600 dark:text-brand-400 text-sm font-medium">{sub}</p>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Form */}
          <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl border border-slate-100 dark:border-slate-700 p-7 shadow-card">
            {sent ? (
              <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="text-center py-12">
                <div className="text-5xl mb-4">✅</div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">Message sent!</h3>
                <p className="text-slate-500 dark:text-slate-400">We'll get back to you within 24 hours.</p>
                <button onClick={() => setSent(false)} className="btn-primary mt-6">Send another</button>
              </motion.div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-6">Send a Message</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Name</label>
                    <input required value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} placeholder="Your name" className="input-base" />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Email</label>
                    <input required type="email" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} placeholder="your@email.com" className="input-base" />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Subject</label>
                  <select value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} className="input-base">
                    <option value="">Select a topic...</option>
                    <option>Data correction / update request</option>
                    <option>Feature suggestion</option>
                    <option>Bug report</option>
                    <option>Partnership / media</option>
                    <option>General question</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 mb-1.5">Message</label>
                  <textarea required rows={5} value={form.message} onChange={e => setForm(f => ({ ...f, message: e.target.value }))} placeholder="Tell us what's on your mind..." className="input-base resize-none" />
                </div>
                <button type="submit" className="btn-primary w-full justify-center py-4">
                  <Send size={16} /> Send Message
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  )
}
