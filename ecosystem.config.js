module.exports = {
    apps: [
      {
        name: "hr-flow-phn",
        script: "node_modules/next/dist/bin/next",
        args: "start -p 3000",
        cwd: "E:/WebProjects/hr-flow-phn",
        env: {
          NODE_ENV: "production",
        },
      },
    ],
  };
  