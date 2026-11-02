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
    <div class="group relative flex items-center">
      <!-- Left Icon -->
      <component
        v-if="leftIcon"
        :is="leftIcon"
        class="absolute left-3 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-brand" />

      <!-- Input -->
      <input
        :id="elementId"
        :type="type"
        :value="modelValue"
        :placeholder="placeholder"
        :disabled="disabled"
        :class="inputClasses"
        @input="updateValue"
        v-bind="attrs" />

      <!-- Loading Icon -->
      <Loader2
        v-if="loading"
        class="absolute right-3 w-4 h-4 animate-spin text-gray-400" />

      <!-- Right Icon -->
      <component
        v-if="rightIcon && !loading"
        :is="rightIcon"
        class="absolute right-3 w-4 h-4 text-gray-400 transition-colors group-focus-within:text-brand" />

      <!-- Right Slot (for buttons etc.) -->
      <slot name="right" v-if="!loading && !rightIcon"></slot>
    </div>

    <!-- Helper Text -->
    <p v-if="helper && !error" class="mt-1 text-xs text-gray-500">
      {{ helper }}
    </p>

    <!-- Error Text -->
    <p v-if="error" class="mt-1 text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>

<script setup>
import { Loader2 } from "@lucide/vue";
import { computed, useAttrs, useId } from "vue";

const props = defineProps({
  modelValue: {
    type: [String, Number],
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
  type: {
    type: String,
    default: "text",
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
  rightIcon: {
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
      props.rightIcon || props.loading ? "pr-10" : "",
      props.error ? "border-red-500 focus:ring-red-500 focus:border-red-500" : "",
    ],
  ].flat();
});

const autoId = useId();
const elementId = computed(() => props.id || autoId);
</script>

