import { InformationPage } from '../components/InformationPage';

export function LegalPage() {
  return <InformationPage kind="legal" title="Mentions légales" description="Les informations relatives à l’éditeur, aux contenus et aux responsabilités du site." sections={[
{ id: 'editeur', title: 'Éditeur de la plateforme', content: <> <p>
            Le site WE MOVE est édité par la société <strong>WE MOVE</strong>, société par actions simplifiée spécialisée dans le déménagement de particuliers, le transfert d'entreprises et le stockage en garde-meubles.
          </p><p>
            Activité de transport routier de marchandises soumise aux règles de la Fédération Française des Déménageurs et aux conventions collectives nationales des transports routiers.
          </p> </> },
{ id: 'propriete-intellectuelle', title: 'Propriété intellectuelle', content: <> <p>
            L'ensemble des contenus (textes, logos, photographies documentaires, graphismes, icônes) présents sur le site sont la propriété exclusive de WE MOVE ou de leurs auteurs respectifs sous licence. Toute reproduction ou utilisation non autorisée est passible de poursuites.
          </p> </> },
{ id: 'responsabilite', title: 'Responsabilité & Assurances', content: <> <p>
            Chaque opération de transport et de déménagement est couverte par une assurance contractuelle de base et fait l'objet d'une déclaration de valeur signée par le client avant l'opération. WE MOVE déploie tous les moyens humains et matériels certifiés pour garantir la parfaite sécurité des biens confiés.
          </p> </> }
  ]}/>;
}
