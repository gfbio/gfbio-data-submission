import getListOfSubmissions from "../api/getListOfSubmissions";

export async function loader() {
    const submissions = await getListOfSubmissions();
    return {submissions};
}
