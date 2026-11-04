<template>
  <div class="sd-page"><div class="sd-page-inner">
    <header class="sd-page-head"><div><p class="sd-eyebrow">Voice of customer</p><h1 class="sd-title">Customer Satisfaction</h1><p class="sd-subtitle">Measure support quality, collect feedback and identify conversations that need attention.</p></div><div class="flex flex-wrap gap-2"><select v-model="period" class="sd-input !w-auto"><option>Last 30 days</option><option>Last 7 days</option><option>This month</option><option>All time</option></select></div></header>
    <section class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      <article v-for="stat in statCards" :key="stat.label" class="sd-card sd-stat"><p class="sd-stat-label">{{stat.label}}</p><div class="flex items-end justify-between"><p class="sd-stat-value">{{stat.value}}</p><span class="mb-1 rounded-full bg-emerald-50 px-2 py-1 text-[10px] font-bold text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">{{stat.note}}</span></div></article>
    </section>
    <section class="mt-5 grid gap-4 xl:grid-cols-[1.2fr_.8fr]">
      <div class="sd-card p-5"><div class="flex flex-wrap items-start justify-between gap-2"><div><h2 class="text-sm font-bold">Rating distribution</h2><p class="mt-1 text-xs sd-muted">Submitted customer ratings · {{period}}</p></div><span class="rounded-full px-3 py-1 text-xs font-bold" style="background:var(--sd-primary-soft);color:var(--sd-primary)">CSAT {{csat}}%</span></div>
        <div class="mt-5 space-y-3"><div v-for="n in [5,4,3,2,1]" :key="n" class="flex items-center gap-3 text-xs"><span class="w-10 font-semibold">{{n}} ★</span><div class="h-2.5 flex-1 overflow-hidden rounded-full" style="background:var(--sd-surface-soft)"><div class="h-full rounded-full" :style="{width:ratingPercent(n)+'%',background:n>=4?'#159b78':n===3?'#d5a33b':'#d66b72'}"></div></div><span class="w-12 text-right sd-muted">{{ratingCounts[n]||0}}</span></div></div>
        <div class="mt-6 rounded-xl p-4" style="background:var(--sd-surface-soft)"><p class="text-xs font-bold">How CSAT works</p><ol class="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-5 sd-muted"><li>Agent resolves a customer conversation.</li><li>Team sends a short rating request using an approved WhatsApp template or supported survey flow.</li><li>Customer selects a star rating only. No comment or extra questions.</li><li>SumashDesk links the response to the conversation and agent for reporting.</li></ol></div>
      </div>
      <div class="sd-card p-5"><h2 class="text-sm font-bold">Survey settings</h2><p class="mt-1 text-xs sd-muted">Control when feedback requests are created in the demo.</p><div class="mt-4 space-y-4">
        <label class="flex items-center justify-between gap-3 text-xs"><span><b>Enable customer ratings</b><small class="mt-1 block sd-muted">Turn CSAT collection on or off.</small></span><input v-model="settings.enabled" type="checkbox" class="h-4 w-4 accent-teal-700"></label>
        <label class="flex items-center justify-between gap-3 text-xs"><span><b>Request after resolution</b><small class="mt-1 block sd-muted">Offer a survey when a conversation is resolved.</small></span><input v-model="settings.afterResolve" type="checkbox" class="h-4 w-4 accent-teal-700"></label>
        <label class="flex items-center justify-between gap-3 text-xs"><span><b>One request per conversation</b><small class="mt-1 block sd-muted">Avoid repeated survey requests.</small></span><input v-model="settings.once" type="checkbox" class="h-4 w-4 accent-teal-700"></label>
        <label class="block text-xs font-semibold">Rating method<select v-model="settings.mode" class="sd-input mt-2"><option value="flow5">5-point rating using star choices</option><option value="quick3">3 numbered WhatsApp reply buttons (1–3)</option></select><small class="mt-1 block font-normal sd-muted">Recommended: WhatsApp Flow with five selectable star-labelled choices. Fallback: three native reply buttons.</small></label>
        
        <label class="block text-xs font-semibold">Low rating alert<select v-model="settings.alert" class="sd-input mt-2"><option>1–2 stars</option><option>1–3 stars</option><option>1 star only</option></select></label>
        <p class="rounded-lg border px-3 py-2 text-[10px] leading-4 sd-muted" style="border-color:var(--sd-border)">Demo mode: resolving a conversation queues a local survey event. Live WhatsApp sending and rating capture require the Cloud API, a published Flow/template and webhook.</p>
        <button class="sd-btn sd-btn-primary w-full" @click="saveSettings">Save survey settings</button>
      </div></div>
    </section>
    <section class="sd-card mt-4 overflow-hidden"><div class="flex flex-wrap items-center justify-between gap-3 border-b p-5" style="border-color:var(--sd-border)"><div><h2 class="text-sm font-bold">Recent feedback</h2><p class="mt-1 text-xs sd-muted">Ratings are linked to conversations and assigned agents.</p></div><input v-model="search" class="sd-input !w-full sm:!w-64" placeholder="Search customer or agent…"></div>
      <div class="overflow-x-auto"><table class="w-full min-w-[720px] text-left text-xs"><thead style="background:var(--sd-surface-soft)"><tr><th class="px-5 py-3 font-semibold sd-muted">Customer</th><th class="px-4 py-3 font-semibold sd-muted">Rating</th><th class="px-4 py-3 font-semibold sd-muted">Agent</th><th class="px-4 py-3 font-semibold sd-muted">Date</th><th class="px-4 py-3 font-semibold sd-muted">Action</th></tr></thead><tbody><tr v-for="row in filtered" :key="row.id" class="border-t" style="border-color:var(--sd-border)"><td class="px-5 py-4 font-semibold">{{row.customer}}</td><td class="px-4 py-4"><span class="font-bold text-amber-500">{{'★'.repeat(row.rating)}}<span class="sd-muted">{{'☆'.repeat(5-row.rating)}}</span></span></td><td class="px-4 py-4">{{row.agent}}</td><td class="px-4 py-4 sd-muted">{{row.date}}</td><td class="px-4 py-4"><button class="font-semibold" style="color:var(--sd-primary)" @click="markReviewed(row)"> {{row.reviewed?'Reviewed':'Mark reviewed'}} </button></td></tr><tr v-if="!filtered.length"><td colspan="5" class="p-8 text-center sd-muted">No feedback matches your search.</td></tr></tbody></table></div>
      <div class="border-t px-5 py-3 text-[10px] sd-muted" style="border-color:var(--sd-border)">Demo feedback data · Saved locally in this browser</div>
    </section>
    <div v-if="notice" class="fixed bottom-5 right-5 z-50 rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">{{notice}}</div>
  </div></div>
</template>
<script setup lang="ts">
import {computed,ref,onMounted,watch} from 'vue'
definePageMeta({layout:'dashboard'});useHead({title:'Customer Satisfaction — SumashDesk'})
type Feedback={id:number;customer:string;rating:number;agent:string;date:string;reviewed:boolean}
const seed:Feedback[]=[{id:1,customer:'Sumon Kundu',rating:5,agent:'Nusrat Jahan',date:'Today, 11:42 AM',reviewed:true},{id:2,customer:'Shalvi Hasan',rating:4,agent:'Mahmud Hasan',date:'Today, 10:18 AM',reviewed:false},{id:3,customer:'Mahbub Rahman',rating:2,agent:'Rafi Ahmed',date:'Yesterday',reviewed:false},{id:4,customer:'Nusrat Jahan',rating:5,agent:'Nusrat Jahan',date:'Nov 02, 2026',reviewed:true},{id:5,customer:'Abdul Latif',rating:3,agent:'Mahmud Hasan',date:'Nov 01, 2026',reviewed:false}]
const feedback=ref<Feedback[]>(seed.map(x=>({...x}))),period=ref('Last 30 days'),search=ref(''),notice=ref('')
const settings=ref({enabled:true,afterResolve:true,once:true,mode:'flow5',alert:'1–2 stars'})
onMounted(()=>{try{const f=localStorage.getItem('sumashdesk-csat');if(f)feedback.value=JSON.parse(f);const s=localStorage.getItem('sumashdesk-csat-settings');if(s)settings.value={...settings.value,...JSON.parse(s)}}catch{}})
watch(feedback,v=>localStorage.setItem('sumashdesk-csat',JSON.stringify(v)),{deep:true})
const ratingCounts=computed(()=>Object.fromEntries([1,2,3,4,5].map(n=>[n,feedback.value.filter(x=>x.rating===n).length])))
const csat=computed(()=>feedback.value.length?Math.round(feedback.value.filter(x=>x.rating>=4).length/feedback.value.length*100):0)
const statCards=computed(()=>[{label:'Customer satisfaction',value:csat.value+'%',note:'4–5 star ratings'},{label:'Responses received',value:String(feedback.value.length),note:'Demo responses'},{label:'Average rating',value:(feedback.value.reduce((a,x)=>a+x.rating,0)/Math.max(feedback.value.length,1)).toFixed(1)+'/5',note:'Across responses'},{label:'Needs review',value:String(feedback.value.filter(x=>x.rating<=2&&!x.reviewed).length),note:'Low rating alerts'}])
const filtered=computed(()=>feedback.value.filter(x=>(x.customer+' '+x.agent).toLowerCase().includes(search.value.toLowerCase())))
function ratingPercent(n:number){return feedback.value.length?ratingCounts.value[n]/feedback.value.length*100:0}
function notify(s:string){notice.value=s;setTimeout(()=>notice.value='',2400)}
function saveSettings(){localStorage.setItem('sumashdesk-csat-settings',JSON.stringify(settings.value));notify('Survey settings saved')}
function markReviewed(row:Feedback){row.reviewed=true;notify('Feedback marked as reviewed')}
</script>