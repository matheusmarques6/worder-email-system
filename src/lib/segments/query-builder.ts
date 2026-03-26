import type { RuleGroupType, RuleType } from "react-querybuilder"

export interface EventFilter {
  eventName: string
  operator: string
  value: number
}

export interface SegmentFilters {
  filters: ProfileFilter[]
  eventFilters: EventFilter[]
}

export interface ProfileFilter {
  field: string
  method: string
  value: string | string[] | null
}

const EVENT_FIELD_PREFIX = "event:"

function isEventField(field: string): boolean {
  return field.startsWith(EVENT_FIELD_PREFIX)
}

function extractEventName(field: string): string {
  return field.replace(EVENT_FIELD_PREFIX, "")
}

function processRule(rule: RuleType): { profileFilter?: ProfileFilter; eventFilter?: EventFilter } {
  const { field, operator, value } = rule

  if (isEventField(field)) {
    return {
      eventFilter: {
        eventName: extractEventName(field),
        operator,
        value: Number(value),
      },
    }
  }

  let method: string
  let filterValue: string | string[] | null = value as string

  switch (operator) {
    case "=":
    case "equals":
      method = "eq"
      break
    case "!=":
    case "not_equals":
      method = "neq"
      break
    case "contains":
      method = "ilike"
      filterValue = `%${value}%`
      break
    case "starts_with":
      method = "ilike"
      filterValue = `${value}%`
      break
    case "ends_with":
      method = "ilike"
      filterValue = `%${value}`
      break
    case "is_set":
      method = "not_is_null"
      filterValue = null
      break
    case "is_not_set":
      method = "is_null"
      filterValue = null
      break
    case ">":
      method = "gt"
      break
    case "<":
      method = "lt"
      break
    case ">=":
      method = "gte"
      break
    case "<=":
      method = "lte"
      break
    case "between":
      method = "between"
      filterValue = String(value).split(",").map((v) => v.trim())
      break
    case "before":
      method = "lt"
      break
    case "after":
      method = "gt"
      break
    case "in_last_days": {
      method = "gte"
      const days = Number(value)
      filterValue = new Date(Date.now() - days * 86400000).toISOString()
      break
    }
    case "in_last_months": {
      method = "gte"
      const months = Number(value)
      const date = new Date()
      date.setMonth(date.getMonth() - months)
      filterValue = date.toISOString()
      break
    }
    default:
      method = "eq"
  }

  return {
    profileFilter: {
      field,
      method,
      value: filterValue,
    },
  }
}

function processGroup(group: RuleGroupType): SegmentFilters {
  const result: SegmentFilters = {
    filters: [],
    eventFilters: [],
  }

  for (const rule of group.rules) {
    if ("combinator" in rule) {
      // Nested group - recursively process
      const nested = processGroup(rule as RuleGroupType)
      result.filters.push(...nested.filters)
      result.eventFilters.push(...nested.eventFilters)
    } else {
      const processed = processRule(rule as RuleType)
      if (processed.profileFilter) {
        result.filters.push(processed.profileFilter)
      }
      if (processed.eventFilter) {
        result.eventFilters.push(processed.eventFilter)
      }
    }
  }

  return result
}

export function buildSupabaseQuery(
  query: RuleGroupType,
  _storeId: string
): SegmentFilters {
  return processGroup(query)
}

export function applyProfileFilters(
  supabaseQuery: ReturnType<ReturnType<typeof import("@supabase/supabase-js").createClient>["from"]>,
  filters: ProfileFilter[]
) {
  let q = supabaseQuery

  for (const filter of filters) {
    switch (filter.method) {
      case "eq":
        q = q.eq(filter.field, filter.value)
        break
      case "neq":
        q = q.neq(filter.field, filter.value)
        break
      case "ilike":
        q = q.ilike(filter.field, filter.value as string)
        break
      case "gt":
        q = q.gt(filter.field, filter.value)
        break
      case "lt":
        q = q.lt(filter.field, filter.value)
        break
      case "gte":
        q = q.gte(filter.field, filter.value)
        break
      case "lte":
        q = q.lte(filter.field, filter.value)
        break
      case "not_is_null":
        q = q.not(filter.field, "is", null)
        break
      case "is_null":
        q = q.is(filter.field, null)
        break
      case "between": {
        const vals = filter.value as string[]
        if (vals.length === 2) {
          q = q.gte(filter.field, vals[0]).lte(filter.field, vals[1])
        }
        break
      }
    }
  }

  return q
}
