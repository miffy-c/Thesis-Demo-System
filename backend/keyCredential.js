export const createKeyCredential = (spName, reviewKey, date) => {
    return (
        {
            '@context': [
              'https://www.w3.org/2018/credentials/v1',
              "https://w3id.org/demoSystem/v1",
            ],
            id: 'http://example.edu/credentials/1872',
            type: [ 'VerifiableCredential', 'ReviewKeyCredential' ],
            issuer: 'https://example.edu/issuers/demoSystem',
            issuanceDate: date,
            credentialSubject: {
              serviceProvider: spName,
              reviewKey: reviewKey,
            }
          }
    )

}