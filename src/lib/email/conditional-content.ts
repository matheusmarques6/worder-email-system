interface ContactData {
  first_name?: string | null
  last_name?: string | null
  email?: string
  phone?: string | null
  created_at?: string
  total_orders?: number
  total_spent?: number
  gender?: string | null
}

/**
 * Process conditional blocks in email HTML
 * Supports: {{#if condition}}content{{/if}}
 * And: {{#if condition}}content{{else}}other{{/if}}
 *
 * Conditions: has_ordered, is_vip, is_new, gender_male, gender_female, has_phone, has_name
 */
export function processConditionalBlocks(
  html: string,
  contact: ContactData,
  _store: Record<string, unknown>
): string {
  // Process {{#if condition}}content{{else}}other{{/if}}
  let result = html.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{else\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_match, condition: string, ifContent: string, elseContent: string) => {
      return evaluateCondition(condition, contact) ? ifContent : elseContent
    }
  )

  // Process {{#if condition}}content{{/if}} (without else)
  result = result.replace(
    /\{\{#if\s+(\w+)\}\}([\s\S]*?)\{\{\/if\}\}/g,
    (_match, condition: string, content: string) => {
      return evaluateCondition(condition, contact) ? content : ""
    }
  )

  return result
}

function evaluateCondition(condition: string, contact: ContactData): boolean {
  switch (condition) {
    case "has_ordered":
      return (contact.total_orders ?? 0) > 0
    case "is_vip":
      return (contact.total_spent ?? 0) > 500
    case "is_new": {
      if (!contact.created_at) return false
      const created = new Date(contact.created_at)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
      return created > thirtyDaysAgo
    }
    case "gender_male":
      return (
        contact.gender?.toLowerCase() === "male" ||
        contact.gender?.toLowerCase() === "masculino"
      )
    case "gender_female":
      return (
        contact.gender?.toLowerCase() === "female" ||
        contact.gender?.toLowerCase() === "feminino"
      )
    case "has_phone":
      return !!contact.phone && contact.phone.length > 0
    case "has_name":
      return !!contact.first_name && contact.first_name.length > 0
    default:
      return false
  }
}
