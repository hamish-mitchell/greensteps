/**
 * AutoForm Interface Definitions
 * 
 * Type definitions and interfaces for the AutoForm component system.
 * These interfaces define the structure for form field configuration,
 * component mappings, dependency management, and field properties.
 * 
 * The AutoForm system uses these types to provide compile-time safety
 * and runtime validation for dynamic form generation from Zod schemas.
 */

import type { Component, InputHTMLAttributes } from "vue";
import type { z, ZodAny } from "zod";
import type { INPUT_COMPONENTS } from "./constant";

/**
 * Field properties interface for AutoForm field components
 * Defines the common properties passed to all field types
 */
export interface FieldProps {
    /** The field name/key for form binding */
    fieldName: string;
    /** Display label for the field (optional, defaults to beautified fieldName) */
    label?: string;
    /** Whether the field is required for form submission */
    required?: boolean;
    /** Custom configuration overrides for the field */
    config?: ConfigItem;
    /** Whether the field should be disabled */
    disabled?: boolean;
}

/**
 * Shape definition interface describing field characteristics
 * Generated from Zod schema analysis and used for field rendering
 */
export interface Shape {
    /** The inferred field type (string, number, date, etc.) */
    type: string;
    /** Default value extracted from the Zod schema */
    default?: any;
    /** Whether the field is required (not optional/nullable) */
    required?: boolean;
    /** Available options for select/enum fields */
    options?: string[];
    /** The underlying Zod schema for this field */
    schema?: ZodAny;
}

/**
 * Input component mapping interface
 * Maps field types to their corresponding Vue components
 */
export interface InputComponents {
    date: Component;
    select: Component;
    radio: Component;
    checkbox: Component;
    switch: Component;
    textarea: Component;
    number: Component;
    string: Component;
    file: Component;
    array: Component;
    object: Component;
}

/**
 * Field configuration item for customizing field appearance and behavior
 * Allows override of default field rendering and properties
 */
export interface ConfigItem {
    /** Custom label text for the field */
    label?: string;
    /** Help text or description shown below the field */
    description?: string;
    /** Override the default component used for rendering */
    component?: keyof typeof INPUT_COMPONENTS | Component;
    /** Hide the field label (useful for checkboxes, etc.) */
    hideLabel?: boolean;
    /** Additional props passed to the input component */
    inputProps?: InputHTMLAttributes;
}

// Define a type to unwrap an array for nested configuration
type UnwrapArray<T> = T extends (infer U)[] ? U : never;

/**
 * Recursive configuration type for nested form structures
 * Allows configuration of complex nested objects and arrays
 */
export type Config<SchemaType extends object> = {
    // If SchemaType.key is an object, create a nested Config, otherwise ConfigItem
    [Key in keyof SchemaType]?: SchemaType[Key] extends any[]
        ? UnwrapArray<Config<SchemaType[Key]>>
        : SchemaType[Key] extends object
          ? Config<SchemaType[Key]>
          : ConfigItem;
};

/**
 * Dependency types for inter-field relationships
 * Defines how fields can affect each other's state and behavior
 */
export enum DependencyType {
    DISABLES,      // Source field disables target field when condition met
    REQUIRES,      // Source field makes target field required when condition met  
    HIDES,         // Source field hides target field when condition met
    SETS_OPTIONS,  // Source field changes available options for target field
}

/**
 * Base dependency interface with common properties
 * Extended by specific dependency type implementations
 */
interface BaseDependency<SchemaType extends z.infer<z.ZodObject<any, any>>> {
    /** The field that triggers the dependency */
    sourceField: keyof SchemaType;
    /** The type of dependency relationship */
    type: DependencyType;
    /** The field that is affected by the dependency */
    targetField: keyof SchemaType;
    /** Function that determines when the dependency is active */
    when: (sourceFieldValue: any, targetFieldValue: any) => boolean;
}

/**
 * Value-based dependency for state changes (disable, require, hide)
 */
export type ValueDependency<SchemaType extends z.infer<z.ZodObject<any, any>>> =
    BaseDependency<SchemaType> & {
        type:
            | DependencyType.DISABLES
            | DependencyType.REQUIRES
            | DependencyType.HIDES;
    };

/** Enum values type for options dependencies */
export type EnumValues = readonly [string, ...string[]];

/**
 * Options dependency for dynamically changing field choices
 */
export type OptionsDependency<
    SchemaType extends z.infer<z.ZodObject<any, any>>,
> = BaseDependency<SchemaType> & {
    type: DependencyType.SETS_OPTIONS;
    /** New options to set when dependency condition is met */
    options: EnumValues;
};

/**
 * Union type for all dependency types
 * Used as the main dependency interface throughout the system
 */
export type Dependency<SchemaType extends z.infer<z.ZodObject<any, any>>> =
    | ValueDependency<SchemaType>
    | OptionsDependency<SchemaType>;
