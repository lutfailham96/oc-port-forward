#!/usr/bin/env node

const argv = require('minimist')(process.argv.slice(2));
const { exec, spawn } = require('child_process');

const reservedArgsKeys = ['_', 'project', 'pods', 'port'];

const showHelp = () => {
  console.info('Usage:\n\t--project\tProject name, ex: my-project\n\t--pods\t\tPods name to be forwarded, usually same as deployment name\n\t--port\t\tForwarded port, ex: 8080:8080\n\nExample: npx oc-port-forward --project my-project --pods webserver --port 8080:8080');
};

if (!Object.keys(argv).every((key) => reservedArgsKeys.includes(key))) {
  showHelp();
  process.exit(1);
}

const { project, pods, port } = argv;
const srcPort = port.split(':')[0];
const dstPort = port.split(':')[1];

exec(`oc project ${project}`, (error, stdout, stderr) => {
  if (error) {
    console.error(`Couldn't find Openshift project named ${project}`);
    process.exit(1);
  } else if (stdout) {
    console.info(`Openshift project: ${project}`);
    exec(`oc get pods -o custom-columns=POD:.metadata.name --no-headers --selector app=${pods} --namespace ${project}`, (error, stdout, stderr) => {
      if (error) {
        console.error(`There is no running pods on ${pods}`);
        process.exit(1);
      } else if (stdout) {
        let podsName;
        if (Array.isArray(stdout)) {
          podsName = stdout[0].trim();
        } else {
          podsName = stdout.trim();
        }
        console.info(`Pods: ${podsName}`);
        const forwardPort = spawn('oc', ['port-forward', '--namespace', `${project}`, `${podsName}`, `${srcPort}:${dstPort}`]);
        forwardPort.stdout.on('data', (stdout) => {
          console.info(stdout.toString());
        });
        forwardPort.stderr.on('data', (sdterr) => {
          console.info(stderr.toString());
        });
        forwardPort.on('exit', (code) => {
          console.log(`child process exited with code ${code.toString()}`);
        });
      } else {
        console.error(stderr);
      }
    });
  } else {
    console.error(stderr);
  }
});
