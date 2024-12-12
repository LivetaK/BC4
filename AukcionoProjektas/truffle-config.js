module.exports = {
  networks: {
    development: {
      host: "127.0.0.1", // Ganache serverio adresas
      port: 7545,        // Ganache serverio prievadas
      network_id: "*",   // Bet koks tinklo ID
    },
  },
  compilers: {
    solc: {
      version: "0.8.0", // Solidity kompiliatoriaus versija
    },
  },
};
