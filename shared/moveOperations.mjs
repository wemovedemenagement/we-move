export const emptyMoveOperations = () => ({
  departureParking: "a_verifier",
  arrivalParking: "a_verifier",
  accessVerified: false,
  equipmentReady: false,
  equipmentNotes: "",
  instructions: "",
});
export const parkingStates = {
  a_verifier: "À vérifier",
  confirme: "Confirmé",
  sans_objet: "Non nécessaire",
};
export function moveOperationIssues(operations) {
  const value = { ...emptyMoveOperations(), ...operations };
  return [
    value.departureParking === "a_verifier" &&
      "Stationnement au départ à vérifier",
    value.arrivalParking === "a_verifier" &&
      "Stationnement à l’arrivée à vérifier",
    !value.accessVerified && "Accès aux deux adresses à vérifier",
    !value.equipmentReady && "Matériel à préparer",
  ].filter((value) => typeof value === "string");
}
