<template>
  <div class="w-full">
    <!-- Label -->
    <label
      v-if="label"
      :for="elementId"
      class="block mb-1 text-sm font-semibold text-gray-800">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>

    <!-- Input Wrapper -->
    <div class="relative flex items-center">
      <!-- Left Icon -->
      <component
        v-if="leftIcon"
        :is="leftIcon"
        class="absolute left-3 w-4 h-4 text-gray-400 transition-colors" />

      <!-- Input -->
      <input
        :id="elementId"
        :type="isVisible ? 'text' : 'password'"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        @input="updateValue"
        v-bind="attrs" />

      <!-- Loading -->
      <Loader2
        v-if="loading"
        class="absolute right-10 w-4 h-4 animate-spin text-gray-400" />

      <!-- Toggle Button -->
      <button
        type="button"
        @click="toggleVisibility"
        class="absolute right-3 flex items-center justify-center cursor-pointer"
        :disabled="disabled">
        <Eye
          v-if="!isVisible"
          class="w-4 h-4 text-gray-400 hover:text-brand transition-colors" />
        <EyeOff v-else class="w-4 h-4 text-gray-400 hover:text-brand transition-colors" />
      </button>
    </div>

    <!-- Helper -->
    <p v-if="helper && !error" class="mt-1 text-xs text-gray-500">
      {{ helper }}
    </p>

    <!-- Error -->
    <p v-if="error" class="mt-1 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { Eye, EyeOff, Loader2 } from "@lucide/vue";
import { computed, ref, useAttrs, useId } from "vue";

const props = defineProps({
  modelValue: {
    type: String,
    default: "",
  },
  label: {
    type: String,
    default: "",
  },
  placeholder: {
    type: String,
    default: "",
  },
  id: {
    type: String,
    default: null,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  loading: {
    type: Boolean,
    default: false,
  },
  error: {
    type: String,
    default: "",
  },
  helper: {
    type: String,
    default: "",
  },
  leftIcon: {
    type: [Object, Function],
    default: null,
  },
  required: {
    type: Boolean,
    default: false,
  },
  customInputClasses: {
    type: String,
    default: "",
  },
});

const emit = defineEmits(["update:modelValue"]);
const attrs = useAttrs();

const isVisible = ref(false);

const toggleVisibility = () => {
  if (props.disabled) return;
  isVisible.value = !isVisible.value;
};

const updateValue = (e) => {
  emit("update:modelValue", e.target.value);
};

const inputClasses = computed(() => {
  return [
    props.customInputClasses || [
      "w-full rounded-lg border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-900 placeholder-gray-400 outline-none transition-colors duration-150",
      "focus:outline-none focus:border-brand focus:ring-2 focus:ring-brand/20",
      "disabled:bg-gray-50 disabled:opacity-60 disabled:cursor-not-allowed",
      props.leftIcon ? "pl-10" : "",
      "pr-10",
      props.error ? "border-red-500 focus:border-red-500" : "",
    ],
  ].flat();
});

const autoId = useId();
const elementId = computed(() => props.id || autoId);
</script>

