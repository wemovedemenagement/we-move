import { draftError } from "./crmDraftModel.mjs";
import {
  emptyMoveOperations,
  parkingStates,
} from "../shared/moveOperations.mjs";
export function normalizeMoveOperations(input, previous) {
  if (input === undefined) return { ...emptyMoveOperations(), ...previous };
  const defaults = emptyMoveOperations();
  if (
    !input ||
    typeof input !== "object" ||
    Array.isArray(input) ||
    Object.keys(input).some((k) => !Object.hasOwn(defaults, k))
  )
    draftError(400, "Préparation de mission invalide.");
  for (const key of ["departureParking", "arrivalParking"])
    if (
      typeof input[key] !== "string" ||
      !Object.hasOwn(parkingStates, input[key])
    )
      draftError(400, "Statut de stationnement invalide.");
  for (const key of ["accessVerified", "equipmentReady"])
    if (typeof input[key] !== "boolean")
      draftError(400, "Vérification de préparation invalide.");
  for (const key of ["equipmentNotes", "instructions"])
    if (typeof input[key] !== "string" || input[key].length > 3000)
      draftError(400, "Les consignes sont limitées à 3 000 caractères.");
  return {
    ...input,
    equipmentNotes: input.equipmentNotes.trim(),
    instructions: input.instructions.trim(),
  };
}
