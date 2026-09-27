import cn from "classnames";

interface SpecTableRow {
  label: string;
  value: string;
  note?: string;
}

interface SpecTableProps {
  rows: SpecTableRow[];
}

// ProjectItem.content의 "항목|값|비고" 파이프 구분 문자열을 표 행으로 렌더링한다 (예: 하드웨어/기술 스택 스펙표)
const SpecTable = ({ rows }: SpecTableProps) => {
  return (
    <div className="rounded-md border border-foreground/10 overflow-hidden">
      <table className="w-full text-sm md:text-base border-collapse">
        <tbody>
          {rows.map((row, index) => (
            <tr key={`spec-row-${index}`} className={cn(index !== 0 && "border-t border-foreground/10")}>
              <th
                scope="row"
                className="w-1/3 px-3 py-2 text-left font-medium text-foreground/50 bg-foreground/5 align-top whitespace-nowrap"
              >
                {row.label}
              </th>
              <td className="px-3 py-2 text-foreground/80 align-top">
                {row.value}
                {row.note && <span className="block text-xs text-foreground/40 mt-0.5">{row.note}</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export function parseSpecRows(content: string[]): SpecTableRow[] {
  return content.map(line => {
    const [label = "", value = "", note] = line.split("|").map(part => part.trim());
    return { label, value, note: note || undefined };
  });
}

export default SpecTable;
