import { InformationPage } from '../components/InformationPage';
import documents from '../data/legalDocuments.json';
export function TermsPage() {
 return <InformationPage kind="terms" title="Conditions générales de vente" description="Le cadre de votre contrat de déménagement : prestations, règlement, responsabilités et livraison." intro={<><p>{documents.intro}</p><a className="information-download" href="/documents/cgv-rgpd-we-move.pdf" download>Télécharger les CGV & RGPD · PDF</a></>} sections={[
 ...documents.chapters.map((chapter,index)=>({id:`chapitre-${index+1}`,title:chapter.title.replace(/^CHAPITRE [IVX]+\s*[:–]\s*/,''),content:<>{chapter.articles.map(article=><article className="terms-article" id={article.id} key={article.id}><h3>{article.title}</h3><p>{article.body}</p></article>)}</>})),
 {id:'document-contractuel',title:'Mentions du document contractuel',content:<><p>{documents.closing}</p><p className="information-source-note">Les mentions de signature ci-dessus sont reproduites du document fourni. La consultation de cette page ne vaut pas signature du contrat.</p></>}
 ]}/>;
}
