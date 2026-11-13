import { expect, test } from "bun:test"
import type { SchSymbol, TextPrimitive } from "../drawing/types"
import symbols from "../generated/symbols-index"

const variants = [
  "mosfet_depletion_normally_on_horz",
  "mosfet_depletion_normally_on_vert",
] as const

test("mosfet_depletion_normally_on variants keep every terminal inside their size box", () => {
  for (const name of variants) {
    const symbol: SchSymbol = symbols[name]
    for (const port of symbol.ports) {
      expect(
        Math.abs(port.x - symbol.center.x),
        `${name} port ${port.labels[0]} x`,
      ).toBeLessThanOrEqual(symbol.size.width / 2 + 1e-9)
      expect(
        Math.abs(port.y - symbol.center.y),
        `${name} port ${port.labels[0]} y`,
      ).toBeLessThanOrEqual(symbol.size.height / 2 + 1e-9)
    }
  }
})

test("mosfet_depletion_normally_on_vert draws {VAL} below the body instead of over the diode", () => {
  const symbol = symbols.mosfet_depletion_normally_on_vert
  const lowestBodyY = Math.min(
    ...symbol.primitives.flatMap((p) =>
      p.type === "path" ? p.points.map((point) => point.y) : [],
    ),
  )
  const val = symbol.primitives.find(
    (p) => p.type === "text" && p.text === "{VAL}",
  ) as TextPrimitive
  const ref = symbol.primitives.find(
    (p) => p.type === "text" && p.text === "{REF}",
  ) as TextPrimitive

  // Both labels hang down from their anchor (middle_top), so the anchor must
  // sit below the lowest point of the drawing.
  expect(val.anchor).toBe("middle_top")
  expect(val.y).toBeLessThan(lowestBodyY)
  expect(ref.y).toBeLessThan(lowestBodyY)
  // {VAL} is stacked under {REF} without the two labels overlapping.
  expect(ref.y - val.y).toBeGreaterThanOrEqual(0.1)
})
