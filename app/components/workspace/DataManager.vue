<template>
  <div class="min-h-screen bg-[var(--sd-bg)] p-4 text-slate-900 sm:p-6 lg:p-8">
    <div class="mx-auto max-w-[1500px]">
      <div class="mb-6 flex flex-wrap items-start justify-between gap-4">
        <div><div class="mb-1 text-[10px] font-bold uppercase tracking-[.16em] text-blue-600">SumashDesk workspace</div><h1 class="text-2xl font-bold tracking-tight">{{ title }}</h1><p class="mt-1 text-sm text-slate-500">{{ description }}</p></div>
        <div class="flex flex-wrap gap-2"><button v-if="importExport" @click="triggerImport" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50">Import CSV</button><button v-if="importExport" @click="exportCsv" class="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold hover:bg-slate-50">Export CSV</button><input ref="fileInput" type="file" accept=".csv,text/csv" class="hidden" @change="importCsv"/><button @click="openCreate" class="rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700">＋ {{ actionLabel || 'Create new' }}</button></div>
      </div>
      <div v-if="stats?.length" class="mb-5 grid grid-cols-2 gap-3 xl:grid-cols-4"><div v-for="s in stats" :key="s.label" class="rounded-xl border border-slate-200 bg-white p-4"><p class="text-xs text-slate-500">{{ s.label }}</p><p class="mt-2 text-2xl font-bold">{{ s.value }}</p><p v-if="s.note" class="mt-1 text-[11px] text-slate-400">{{ s.note }}</p></div></div>
      <section class="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div class="flex flex-wrap items-center gap-2 border-b border-slate-100 p-4"><input v-model="search" :placeholder="searchPlaceholder || `Search ${title.toLowerCase()}...`" class="h-10 min-w-[220px] flex-1 rounded-lg border border-slate-200 px-3 text-sm outline-none focus:border-blue-400"/><select v-if="filters?.length" v-model="filter" class="h-10 rounded-lg border border-slate-200 bg-white px-3 text-xs"><option value="">All statuses</option><option v-for="f in filters" :key="f">{{ f }}</option></select><span class="ml-auto text-xs text-slate-400">{{ filtered.length }} records</span></div>
        <div class="overflow-x-auto"><table class="w-full min-w-[760px] text-left"><thead class="bg-slate-50 text-[10px] font-bold uppercase tracking-wide text-slate-500"><tr><th v-for="c in columns" :key="c" class="px-4 py-3">{{ c }}</th><th class="px-4 py-3 text-right">Actions</th></tr></thead><tbody><tr v-for="row in filtered" :key="row.id" class="border-t border-slate-100 text-xs hover:bg-slate-50/70"><td v-for="c in columns" :key="c" class="max-w-[260px] px-4 py-3.5 text-slate-600"><span v-if="c===columns[0]" class="font-semibold text-slate-900">{{ row[c] }}</span><span v-else-if="/status|approval|priority/i.test(c)" :class="badgeClass(String(row[c]||''))" class="rounded-full px-2 py-1 text-[10px] font-semibold">{{ row[c] ?? '—' }}</span><span v-else class="block truncate">{{ display(row[c]) }}</span></td><td class="px-4 py-3 text-right"><button v-if="storageKey==='campaigns' && ['Scheduled','Paused','Draft'].includes(String(row.Status))" @click="campaignAction(row, String(row.Status)==='Paused'?'Scheduled':'Paused')" class="mr-1 rounded-md px-2 py-1.5 font-semibold text-emerald-700 hover:bg-emerald-50">{{ row.Status==='Paused' ? 'Resume' : 'Pause' }}</button><button v-if="storageKey==='campaigns' && row.Status!=='Cancelled' && row.Status!=='Completed'" @click="campaignAction(row,'Cancelled')" class="mr-1 rounded-md px-2 py-1.5 font-semibold text-rose-600 hover:bg-rose-50">Cancel</button><button @click="openEdit(row)" class="mr-1 rounded-md px-2 py-1.5 font-semibold text-teal-700 hover:bg-teal-50">Edit</button><button @click="removeRow(row)" class="rounded-md px-2 py-1.5 font-semibold text-rose-600 hover:bg-rose-50">Delete</button></td></tr><tr v-if="!filtered.length"><td :colspan="columns.length+1" class="px-4 py-14 text-center"><div class="text-sm font-semibold text-slate-700">No records found</div><p class="mt-1 text-xs text-slate-400">Try another search or create a new record.</p></td></tr></tbody></table></div>
        <div class="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-[11px] text-slate-400"><span>Demo data is saved in this browser.</span><button @click="resetData" class="font-semibold text-slate-500 hover:text-blue-600">Reset demo data</button></div>
      </section>
    </div>
    <div v-if="modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/40 p-4" @click.self="modal=false"><div class="w-full max-w-lg rounded-2xl bg-white p-5 shadow-2xl"><div class="mb-4 flex items-center justify-between"><div><h2 class="text-lg font-bold">{{ editing ? 'Edit record' : actionLabel || 'Create record' }}</h2><p class="mt-1 text-xs text-slate-500">Changes are stored locally as demo data.</p></div><button @click="modal=false" class="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-100">✕</button></div><form @submit.prevent="save" class="space-y-3"><label v-for="c in columns" :key="c" class="block text-xs font-semibold text-slate-600">{{ c }}<textarea v-if="/note|message|description|content/i.test(c)" v-model="form[c]" rows="3" class="mt-1.5 w-full rounded-lg border border-slate-200 p-3 text-sm font-normal outline-none focus:border-blue-400"/><input v-else v-model="form[c]" :required="c===columns[0]" class="mt-1.5 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-normal outline-none focus:border-blue-400"/></label><div class="flex justify-end gap-2 border-t border-slate-100 pt-4"><button type="button" @click="modal=false" class="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold">Cancel</button><button class="rounded-lg bg-blue-600 px-5 py-2 text-xs font-semibold text-white">Save</button></div></form></div></div>
    <div v-if="toast" class="fixed bottom-5 right-5 z-[110] rounded-xl bg-slate-900 px-4 py-3 text-xs font-semibold text-white shadow-xl">{{ toast }}</div>
  </div>
</template>
<script setup lang="ts">
import { computed, reactive, ref } from 'vue'
interface Stat { label:string; value:string; note?:string }
interface Row { id:string; [key:string]:unknown }
const props=defineProps<{title:string;description:string;columns:string[];initialRows:Row[];stats?:Stat[];filters?:string[];actionLabel?:string;searchPlaceholder?:string;importExport?:boolean;storageKey:string}>()
const collection=useDemoCollection<Row>(props.storageKey,props.initialRows)
const search=ref(''),filter=ref(''),modal=ref(false),editing=ref(''),toast=ref('')
const form=reactive<Record<string,string>>({})
const fileInput=ref<HTMLInputElement|null>(null)
const filtered=computed(()=>collection.rows.value.filter(r=>{const text=Object.values(r).join(' ').toLowerCase();const matchesFilter=!filter.value||Object.values(r).some(v=>String(v).toLowerCase()===filter.value.toLowerCase());return text.includes(search.value.toLowerCase())&&matchesFilter}))
function display(v:unknown){return Array.isArray(v)?v.join(', '):String(v??'—')}
function badgeClass(v:string){return /active|approved|completed|connected|read/i.test(v)?'bg-emerald-50 text-emerald-700':/pending|scheduled|draft|busy/i.test(v)?'bg-amber-50 text-amber-700':/failed|rejected|inactive|overdue/i.test(v)?'bg-rose-50 text-rose-700':'bg-slate-100 text-slate-600'}
function openCreate(){editing.value='';for(const c of props.columns)form[c]='';modal.value=true}
function openEdit(r:Row){editing.value=r.id;for(const c of props.columns)form[c]=display(r[c]);modal.value=true}
function save(){if(editing.value)collection.update(editing.value,form as Partial<Row>);else collection.add(form as Omit<Row,'id'>);modal.value=false;notify('Saved successfully')}
function removeRow(r:Row){if(confirm(`Delete ${display(r[props.columns[0]])}?`)){collection.remove(r.id);notify('Record deleted')}}
function resetData(){if(confirm('Reset this section to its original demo data?')){collection.reset();notify('Demo data reset')}}
function notify(s:string){toast.value=s;setTimeout(()=>toast.value='',2200)}
function campaignAction(row:Row,status:string){collection.update(row.id,{Status:status} as Partial<Row>);notify(`Campaign ${status.toLowerCase()}`)}
function triggerImport(){fileInput.value?.click()}
function importCsv(event:Event){
 const file=(event.target as HTMLInputElement).files?.[0]; if(!file)return
 const reader=new FileReader(); reader.onload=()=>{
  const lines=String(reader.result||'').split(/\r?\n/).filter(Boolean)
  if(lines.length<2){notify('CSV has no records');return}
  const parse=(line:string)=>line.split(',').map(x=>x.trim().replace(/^"|"$/g,''))
  const headers=parse(lines[0]); let count=0
  for(const line of lines.slice(1)){const cells=parse(line);const record:Record<string,string>={};headers.forEach((h,i)=>{if(h && h!=='id')record[h]=cells[i]||''});if(Object.keys(record).length){collection.add(record as Omit<Row,'id'>);count++}}
  notify(`${count} records imported`)
 }; reader.readAsText(file); (event.target as HTMLInputElement).value=''
}
function exportCsv(){const esc=(v:unknown)=>`"${display(v).replaceAll('"','""')}"`;const csv=[props.columns.map(esc).join(','),...filtered.value.map(r=>props.columns.map(c=>esc(r[c])).join(','))].join('\n');const url=URL.createObjectURL(new Blob([csv],{type:'text/csv'}));const a=document.createElement('a');a.href=url;a.download=`${props.storageKey}.csv`;a.click();URL.revokeObjectURL(url)}
</script>
