import { AllNamespaces } from "../utils/namespaces";

jest.setTimeout(60000);

describe("Unit tests to make sure functionality is working as expected", () => {
    let namespaces:AllNamespaces;

    beforeAll(() => {
        namespaces = new AllNamespaces();
    })

    it("Should parse json string properly", () => {
        const jsonString = "foobar { word {}} {text {}} {}";
        const parsedList = namespaces.matchNestedBraces(jsonString);
        expect(parsedList).toEqual(['{ word {}}', '{text {}}', '{}'])
    })
})