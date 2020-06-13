const staticConfig = {
  domain: 'budb-hegiphy.auth0.com',
  clientId: '9MtcuIsGBr2h6omLSRi8hfcI49uFOX3F',
  audience: 'https://hegiphy.budjb.com',
};

const localConfig = {
  ...staticConfig,
  hegiphyApiBaseUri: 'http://localhost:8000',
};

const productionConfig = {
  ...staticConfig,
  hegiphyApiBaseUri: 'https://api.hegiphy.budjb.com',
};

export default process.env.NODE_ENV === 'production' ? productionConfig : localConfig;
