<!--
/**
 * AutoForm Component - Dynamic Form Generation from Zod Schemas
 * 
 * A powerful form component that automatically generates form fields, validation,
 * and UI elements from Zod schema definitions. This component is used throughout
 * GreenSteps for consistent form handling while reducing boilerplate code.
 * 
 * Key Features:
 * - Automatic field type inference from Zod schemas
 * - Built-in validation with real-time feedback
 * - Customizable field configurations and styling
 * - Support for complex field dependencies and conditional logic
 * - Accessibility-compliant form controls
 * - Integration with the design system components
 * 
 * Supported Field Types:
 * - Text inputs (string, email, url, etc.)
 * - Number inputs with validation
 * - Date/time pickers
 * - Select dropdowns and radio groups
 * - Checkboxes and toggle switches
 * - File upload components
 * - Array fields for dynamic lists
 * - Nested object fields
 * 
 * @component AutoForm
 * @example
 * <AutoForm 
 *   :schema="userProfileSchema" 
 *   :field-config="fieldCustomizations"
 *   @submit="handleFormSubmit" 
 * />
 */
-->

<script setup lang="ts" generic="T extends ZodObjectOrWrapped">
import type { FormContext, GenericObject } from "vee-validate";
import type { z, ZodAny } from "zod";
import type { Config, ConfigItem, Dependency, Shape } from "./interface";
import { Form } from "@/components/ui/form";
import { toTypedSchema } from "@vee-validate/zod";
import { computed, toRefs } from "vue";
import AutoFormField from "./AutoFormField.vue";
import { provideDependencies } from "./dependencies";
import {
    getBaseSchema,
    getBaseType,
    getDefaultValueInZodStack,
    getObjectFormSchema,
    type ZodObjectOrWrapped,
} from "./utils";

/**
 * Component props interface
 */
const props = defineProps<{
    /** Zod schema defining the form structure and validation rules */
    schema: T;
    /** Optional vee-validate form context for external form control */
    form?: FormContext<GenericObject>;
    /** Field-specific configuration overrides for customization */
    fieldConfig?: Config<z.infer<T>>;
    /** Inter-field dependencies for conditional logic */
    dependencies?: Dependency<z.infer<T>>[];
}>();

/**
 * Component events
 */
const emits = defineEmits<{
    submit: [event: z.infer<T>];
}>();

const { dependencies } = toRefs(props);
provideDependencies(dependencies);

const shapes = computed(() => {
    // @ts-expect-error ignore {} not assignable to object
    const val: { [key in keyof T]: Shape } = {};
    const baseSchema = getObjectFormSchema(props.schema);
    const shape = baseSchema.shape;
    Object.keys(shape).forEach((name) => {
        const item = shape[name] as ZodAny;
        const baseItem = getBaseSchema(item) as ZodAny;
        let options =
            baseItem && "values" in baseItem._def
                ? (baseItem._def.values as string[])
                : undefined;
        if (!Array.isArray(options) && typeof options === "object")
            options = Object.values(options);

        val[name as keyof T] = {
            type: getBaseType(item),
            default: getDefaultValueInZodStack(item),
            options,
            required: !["ZodOptional", "ZodNullable"].includes(
                item._def.typeName
            ),
            schema: baseItem,
        };
    });
    return val;
});

const fields = computed(() => {
    // @ts-expect-error ignore {} not assignable to object
    const val: {
        [key in keyof z.infer<T>]: {
            shape: Shape;
            fieldName: string;
            config: ConfigItem;
        };
    } = {};
    for (const key in shapes.value) {
        const shape = shapes.value[key];
        val[key as keyof z.infer<T>] = {
            shape,
            config: props.fieldConfig?.[key] as ConfigItem,
            fieldName: key,
        };
    }
    return val;
});

const formComponent = computed(() => (props.form ? "form" : Form));
const formComponentProps = computed(() => {
    if (props.form) {
        return {
            onSubmit: props.form.handleSubmit((val) => emits("submit", val)),
        };
    } else {
        const formSchema = toTypedSchema(props.schema);
        return {
            keepValues: true,
            validationSchema: formSchema,
            onSubmit: (val: GenericObject) => emits("submit", val),
        };
    }
});
</script>

<template>
    <component :is="formComponent" v-bind="formComponentProps">
        <slot name="customAutoForm" :fields="fields">
            <template v-for="(shape, key) of shapes" :key="key">
                <slot
                    :shape="shape"
                    :name="key.toString() as keyof z.infer<T>"
                    :field-name="key.toString()"
                    :config="
                        fieldConfig?.[
                            key as keyof typeof fieldConfig
                        ] as ConfigItem
                    "
                >
                    <AutoFormField
                        :config="
                            fieldConfig?.[
                                key as keyof typeof fieldConfig
                            ] as ConfigItem
                        "
                        :field-name="key.toString()"
                        :shape="shape"
                    />
                </slot>
            </template>
        </slot>

        <slot :shapes="shapes" />
    </component>
</template>
