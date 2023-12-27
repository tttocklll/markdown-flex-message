import { Token } from "marked"
import { FlexComponent } from "@line/bot-sdk"
import { MainConverter } from "../MainConverter"

export class InlineConverter {
  convert(tokens: Token[]): FlexComponent[] {
    const mainConverter = new MainConverter()
    const components: FlexComponent[] = []
    tokens.forEach(childToken => {
      const childComponents = mainConverter.convert(childToken)
      if (this.isInline(childToken)) {
        childComponents.forEach(component => {
          if (component.type === "span") {
            if (components.length === 0 || !this.isTextWithContents(components[components.length - 1])) {
              components.push({
                type: "text",
                wrap: true,
                contents: []
              })
            }
            // Type Guard for avoiding type error
            if (components.length === 0) {
              throw new Error("components.length === 0")
            }
            const block = components[components.length - 1]
            // Type Guard for avoiding type error
            if (block.type !== "text" || block.text || !block.contents) {
              throw new Error("block.type !== 'text' || block.text || !block.contents")
            }
            block.contents.push(component)
          } else {
            components.push(component)
          }
        })
      } else {
        childComponents.forEach(component => {
          components.push(component)
        })
      }
    })
    return components
  }
  private isTextWithContents(component: FlexComponent): boolean {
    return Boolean(component.type === "text" && !component.text && component.contents)
  }
  private isInline(token: Token): boolean {
    const inlineTypes = [
      "text",
      "strong",
      "em",
      "codespan",
      "del",
      "text",
    ]
    return inlineTypes.includes(token.type)
  }
}