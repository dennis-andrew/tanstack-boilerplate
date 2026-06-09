import { useStore } from '@tanstack/react-form'
import type { HTMLAttributes, HTMLInputTypeAttribute } from 'react'

import { useFieldContext, useFormContext } from '#/hooks/demo.form-context'

export function SubscribeButton({ label }: { label: string }) {
  const form = useFormContext()
  return (
    <form.Subscribe
      selector={(state) => [state.canSubmit, state.isSubmitting] as const}
    >
      {([canSubmit, isSubmitting]) => (
        <button
          type="submit"
          disabled={!canSubmit || isSubmitting}
          className="px-6 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 transition-colors disabled:opacity-50"
        >
          {isSubmitting ? 'Submitting...' : label}
        </button>
      )}
    </form.Subscribe>
  )
}

function getErrorMessage(error: unknown) {
  if (typeof error === 'string') {
    return error
  }

  if (
    error &&
    typeof error === 'object' &&
    'message' in error &&
    typeof error.message === 'string'
  ) {
    return error.message
  }

  return 'Invalid value'
}

function ErrorMessages({ errors, id }: { errors: Array<unknown>; id: string }) {
  const messages = Array.from(new Set(errors.map(getErrorMessage)))

  return (
    <div id={id}>
      {messages.map((message) => (
        <div key={message} className="text-red-500 mt-1 font-bold">
          {message}
        </div>
      ))}
    </div>
  )
}

export function TextField({
  label,
  placeholder,
  type = 'text',
  autoComplete,
  inputMode,
}: {
  label: string
  placeholder?: string
  type?: HTMLInputTypeAttribute
  autoComplete?: string
  inputMode?: HTMLAttributes<HTMLInputElement>['inputMode']
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const errorId = `${field.name}-errors`
  const hasErrors = field.state.meta.isTouched && errors.length > 0

  return (
    <div>
      <label htmlFor={field.name} className="block font-bold mb-1 text-xl">
        {label}
      </label>
      <input
        id={field.name}
        name={field.name}
        type={type}
        value={field.state.value}
        placeholder={placeholder}
        autoComplete={autoComplete}
        inputMode={inputMode}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {hasErrors && <ErrorMessages id={errorId} errors={errors} />}
    </div>
  )
}

export function TextArea({
  label,
  rows = 3,
}: {
  label: string
  rows?: number
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const errorId = `${field.name}-errors`
  const hasErrors = field.state.meta.isTouched && errors.length > 0

  return (
    <div>
      <label htmlFor={field.name} className="block font-bold mb-1 text-xl">
        {label}
      </label>
      <textarea
        id={field.name}
        name={field.name}
        value={field.state.value}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        onBlur={field.handleBlur}
        rows={rows}
        onChange={(e) => field.handleChange(e.target.value)}
        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      />
      {hasErrors && <ErrorMessages id={errorId} errors={errors} />}
    </div>
  )
}

export function Select({
  label,
  values,
  placeholder,
}: {
  label: string
  values: Array<{ label: string; value: string }>
  placeholder?: string
}) {
  const field = useFieldContext<string>()
  const errors = useStore(field.store, (state) => state.meta.errors)
  const errorId = `${field.name}-errors`
  const hasErrors = field.state.meta.isTouched && errors.length > 0

  return (
    <div>
      <label htmlFor={field.name} className="block font-bold mb-1 text-xl">
        {label}
      </label>
      <select
        id={field.name}
        name={field.name}
        value={field.state.value}
        aria-invalid={hasErrors}
        aria-describedby={hasErrors ? errorId : undefined}
        onBlur={field.handleBlur}
        onChange={(e) => field.handleChange(e.target.value)}
        className="w-full px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
      >
        {placeholder ? (
          <option value="" disabled>
            {placeholder}
          </option>
        ) : null}
        {values.map((value) => (
          <option key={value.value} value={value.value}>
            {value.label}
          </option>
        ))}
      </select>
      {hasErrors && <ErrorMessages id={errorId} errors={errors} />}
    </div>
  )
}
