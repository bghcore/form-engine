import React from "react";
import { useFieldArray, useFormContext } from "react-hook-form";
import { IFieldArrayConfig } from "../types/IFieldArrayConfig";

export interface IHookFieldArrayProps {
  fieldName: string;
  config: IFieldArrayConfig;
  renderItem: (itemFieldNames: string[], index: number, remove: () => void) => React.ReactNode;
  renderAddButton?: (append: () => void, canAdd: boolean) => React.ReactNode;
}

export const HookFieldArray: React.FC<IHookFieldArrayProps> = (props) => {
  const { fieldName, config, renderItem, renderAddButton } = props;
  const { control } = useFormContext();
  const { fields, append, remove, move } = useFieldArray({ control, name: fieldName });

  const canAdd = config.maxItems ? fields.length < config.maxItems : true;
  const canRemove = config.minItems ? fields.length > config.minItems : true;

  const handleAppend = React.useCallback(() => {
    if (canAdd) {
      append(config.defaultItem ?? {});
    }
  }, [canAdd, append, config.defaultItem]);

  const handleRemove = React.useCallback((index: number) => {
    if (canRemove) {
      remove(index);
    }
  }, [canRemove, remove]);

  const itemFieldNames = React.useMemo(
    () => Object.keys(config.itemFields),
    [config.itemFields]
  );

  return (
    <div className="field-array">
      {fields.map((field, index) => (
        <div key={field.id} className="field-array-item">
          {renderItem(
            itemFieldNames.map(name => `${fieldName}.${index}.${name}`),
            index,
            () => handleRemove(index)
          )}
        </div>
      ))}
      {renderAddButton?.(handleAppend, canAdd)}
    </div>
  );
};
