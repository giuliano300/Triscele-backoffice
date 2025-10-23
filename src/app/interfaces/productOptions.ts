import { ConditionalLogic, FieldTypes } from "../enum/enum";
import { OptionRow } from "./optionRow";

export interface ProductOptions {
  _id?: string;
  position?: number;
  label?: string;
  name?: string;
  fieldType?: FieldTypes;
  required?: boolean;
  conditionalLogic?: ConditionalLogic;
  parentId?: string;
  parentOptionRowId?: string;
  optionRows?: OptionRow[];
}
