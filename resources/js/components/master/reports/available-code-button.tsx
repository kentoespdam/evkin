import TooltipBuilder from "@/components/commons/tooltip-builder";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { MasterInput } from "@/types/master-input";
import { memo } from "react";

interface AvailableCodeButtonProps {
  availableCode: MasterInput[];
  formulaRef: React.RefObject<HTMLTextAreaElement | null>;
  currentCode?: string;
}

const AvailableCodeButton = memo(
  ({ availableCode, formulaRef, currentCode }: AvailableCodeButtonProps) => {
    const operatorClick = (item: string) => {
      if (!formulaRef.current) return;
      const formula = formulaRef.current.value;
      formulaRef.current.value = `${formula}${item} `;
      formulaRef.current.focus();
    };

    const kodeClick = (item: MasterInput) => {
      if (!formulaRef.current) return;
      const formula = formulaRef.current.value;
      formulaRef.current.value = `${formula}${item.kode} `;
      formulaRef.current.focus();
    };

    return (
      <div className="grid gap-2">
        <Label>Operator</Label>
        <div className="flex gap-2">
          <TooltipBuilder text="tambah">
            <Button size="sm" type="button" onClick={() => operatorClick("+")}>
              +
            </Button>
          </TooltipBuilder>
          <TooltipBuilder text="Kurang">
            <Button size="sm" type="button" onClick={() => operatorClick("-")}>
              -
            </Button>
          </TooltipBuilder>
          <TooltipBuilder text="Kali">
            <Button size="sm" type="button" onClick={() => operatorClick("*")}>
              *
            </Button>
          </TooltipBuilder>
          <TooltipBuilder text="Bagi">
            <Button size="sm" type="button" onClick={() => operatorClick("/")}>
              /
            </Button>
          </TooltipBuilder>
          <TooltipBuilder text="Buka Kurung">
            <Button size="sm" type="button" onClick={() => operatorClick("(")}>
              (
            </Button>
          </TooltipBuilder>
          <TooltipBuilder text="Tutup Kurung">
            <Button size="sm" type="button" onClick={() => operatorClick(")")}>
              )
            </Button>
          </TooltipBuilder>
        </div>
        <Label>Available Kode</Label>
        <div className="max-w-full flex flex-wrap gap-2">
          {availableCode.map((item) =>
            item.kode === currentCode ? null : (
              <div key={item.kode}>
                <TooltipBuilder text={item.description}>
                  <Button
                    size="sm"
                    onClick={() => kodeClick(item)}
                    type="button"
                  >
                    {item.kode}
                  </Button>
                </TooltipBuilder>
              </div>
            ),
          )}
        </div>
      </div>
    );
  },
);

AvailableCodeButton.displayName = "AvailableCodeButton";

export default AvailableCodeButton;
