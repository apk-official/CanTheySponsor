import React from 'react'
import { Separator } from './ui/separator'

export default function Footer() {
  return (
    <section className='flex flex-col w-full md:1/2 pt-4'>
      <Separator className="" />
      <p className='pt-4 font-sans text-sm text-muted-foreground'><span className='text-foreground'>CanTheySponsor ·</span> An unofficial search interface over the UK Home Office's Register of Licensed Sponsors.</p>
      <p className='pt-2 pb-6 font-mono text-xs text-muted-foreground'>Data shown is a 1,900-row demonstration sample; the full register has 141,204 organisations. Always verify on GOV.UK before making decisions.</p>
    </section>
  )
}
