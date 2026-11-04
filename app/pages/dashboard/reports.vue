<template>
    <div class="min-h-screen p-5 md:p-7">
        <div class="mb-6 flex flex-wrap items-end justify-between gap-3">
            <div>
                <p class="text-[10px] font-bold uppercase tracking-[.16em] text-blue-600">Performance</p>
                <h1 class="mt-1 text-2xl font-bold">Reports & analytics</h1>
                <p class="mt-1 text-sm text-slate-500">Understand conversations, response times and team performance.
                </p>
            </div><select v-model="range" class="h-9 rounded-lg border border-slate-200 bg-white px-3 text-xs">
                <option>Last 7 days</option>
                <option>Last 30 days</option>
                <option>This month</option>
            </select>
        </div>
        <div class="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <div v-for="s in stats" :key="s.label" class="rounded-xl border border-slate-200 bg-white p-4">
                <p class="text-xs text-slate-500">{{ s.label }}</p>
                <p class="mt-2 text-2xl font-bold">{{ s.value }}</p>
                <p class="mt-1 text-[10px] font-semibold text-emerald-600">{{ s.note }}</p>
            </div>
        </div>
        <div class="mt-5 grid gap-4 xl:grid-cols-2">
            <section class="rounded-xl border border-slate-200 bg-white p-5">
                <h2 class="text-sm font-bold">Conversation volume</h2>
                <p class="text-xs text-slate-500">Incoming and outgoing messages · {{ range }}</p>
                <div class="mt-6 flex h-48 items-end justify-around gap-3">
                    <div v-for="(v, i) in bars" :key="i" class="flex h-full flex-1 items-end justify-center gap-1">
                        <div class="w-4 rounded-t bg-blue-500" :style="{ height: v + '%' }"></div>
                        <div class="w-4 rounded-t bg-emerald-400" :style="{ height: (v * .72) + '%' }"></div>
                    </div>
                </div>
                <div class="mt-3 flex justify-center gap-4 text-[10px] text-slate-500"><span>🔵 Incoming</span><span>🟢
                        Outgoing</span></div>
            </section>
            <section class="rounded-xl border border-slate-200 bg-white p-5">
                <h2 class="text-sm font-bold">Agent performance</h2>
                <p class="text-xs text-slate-500">Resolved conversations by team member</p>
                <div class="mt-5 space-y-5">
                    <div v-for="a in agentStats" :key="a.name">
                        <div class="mb-1.5 flex justify-between text-xs"><span
                                class="font-semibold">{{ a.name }}</span><span class="text-slate-500">{{ a.count }}
                                conversations</span></div>
                        <div class="h-2 overflow-hidden rounded-full bg-slate-100">
                            <div class="h-full rounded-full bg-blue-600" :style="{ width: a.width + '%' }"></div>
                        </div>
                    </div>
                </div>
            </section>
        </div>
        <div class="mt-5 grid gap-4 xl:grid-cols-3">
            <section class="rounded-xl border border-slate-200 bg-white p-5">
                <h2 class="text-sm font-bold">Message statistics</h2>
                <p class="mt-1 text-[11px] text-slate-500">Traffic summary · {{ range }}</p>
                <div class="mt-4 space-y-3">
                    <div class="flex justify-between text-xs"><span class="text-slate-500">Incoming
                            messages</span><b>8,420</b></div>
                    <div class="h-2 rounded-full bg-slate-100">
                        <div class="h-2 w-[78%] rounded-full bg-blue-500"></div>
                    </div>
                    <div class="flex justify-between text-xs"><span class="text-slate-500">Outgoing
                            messages</span><b>6,180</b></div>
                    <div class="h-2 rounded-full bg-slate-100">
                        <div class="h-2 w-[58%] rounded-full bg-emerald-500"></div>
                    </div>
                </div>
            </section>
            <section class="rounded-xl border border-slate-200 bg-white p-5">
                <h2 class="text-sm font-bold">Broadcast performance</h2>
                <p class="mt-1 text-[11px] text-slate-500">Recent campaign delivery</p>
                <div class="mt-4 grid grid-cols-2 gap-3">
                    <div class="rounded-lg bg-slate-50 p-3">
                        <p class="text-[10px] text-slate-500">Delivered</p><b class="mt-1 block text-xl">94.8%</b>
                    </div>
                    <div class="rounded-lg bg-slate-50 p-3">
                        <p class="text-[10px] text-slate-500">Read rate</p><b class="mt-1 block text-xl">72.4%</b>
                    </div>
                </div>
            </section>
            <section class="rounded-xl border border-slate-200 bg-white p-5">
                <h2 class="text-sm font-bold">Conversation health</h2>
                <p class="mt-1 text-[11px] text-slate-500">Current support queue</p>
                <div class="mt-4 space-y-3 text-xs">
                    <div class="flex justify-between"><span class="text-slate-500">Unresolved</span><b>24</b></div>
                    <div class="flex justify-between"><span class="text-slate-500">Waiting for reply</span><b
                            class="text-amber-600">12</b></div>
                    <div class="flex justify-between"><span class="text-slate-500">Overdue SLA</span><b
                            class="text-rose-600">4</b></div>
                </div>
            </section>
        </div>
    </div>
</template>
<script setup lang="ts">
import { ref } from 'vue'; definePageMeta({ layout: 'dashboard' }); useHead({ title: 'Reports — SumashDesk' }); const range = ref('Last 7 days'); const stats = [{ label: 'Total conversations', value: '1,284', note: '+12.8% vs previous period' }, { label: 'Resolved conversations', value: '1,106', note: '86.1% resolution rate' }, { label: 'First response time', value: '4m 32s', note: '-8.4% improvement' }, { label: 'SLA achieved', value: '94.2%', note: '+2.1% vs previous period' }]; const bars = [38, 58, 46, 74, 62, 88, 70]; const agentStats = [{ name: 'Nusrat Jahan', count: 342, width: 92 }, { name: 'Mahmud Hasan', count: 286, width: 78 }, { name: 'Sadikul Islam', count: 224, width: 62 }, { name: 'Rafi Ahmed', count: 178, width: 49 }]
</script>