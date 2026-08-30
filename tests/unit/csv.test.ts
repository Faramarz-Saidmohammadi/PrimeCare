import { describe, expect, it } from "vitest";
import { escapeCsvCell } from "@/lib/csv";

describe("CSV serialization", () => {
  it("quotes commas, line breaks, and embedded quotes", () => {
    expect(escapeCsvCell('Dentist, "Suite A"\nKabul')).toBe('"Dentist, ""Suite A""\nKabul"');
  });

  it.each(["=2+2", "+cmd|calc", "-10+20", "@SUM(A1:A2)", "  =HYPERLINK(\"https://example.com\")"])(
    "neutralizes spreadsheet formula input %s",
    (value) => expect(escapeCsvCell(value)).toBe(`"'${value.replaceAll('"', '""')}"`),
  );

  it("keeps ordinary text unchanged", () => {
    expect(escapeCsvCell("Routine Checkup")).toBe('"Routine Checkup"');
    expect(escapeCsvCell(null)).toBe('""');
  });
});
