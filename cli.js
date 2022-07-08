#!/bin/env -S node --no-warnings
import ApiClient from "./lib/ApiClient.js";
import {emphasize} from "emphasize";
import {program} from "commander";
import {readFile, stat, writeFile} from "fs/promises";
import ora from "ora";
import path from "path";
import url from "url";

const packageJson = JSON.parse((await readFile(path.join(url.fileURLToPath(new URL('.', import.meta.url)), "./package.json"))).toString());
const config = JSON.parse((await readFile(path.join(url.fileURLToPath(new URL('.', import.meta.url)), "./config.json"))).toString());
// if .token file exists, read it
let token;
try {
    token = (await readFile(path.join(url.fileURLToPath(new URL('.', import.meta.url)), ".token"))).toString();
}
catch (e) {}
const apiClient = token ? new ApiClient(token) : null;

if (!config.verifySSL) process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

program
    .name(config.command.name)
    .description(config.command.description)
    .version(packageJson.version);

program.command("login")
    .description("Set-up authentication")
    .option("-t, --token <token>", "API token")
    .option("-u, --username <username>", "Username/e-mail")
    .option("-p, --password <password>", "Password")
    .option("--raw", "Print raw token")
    .action(async (options) => {
        const spinner = options.raw ? null : ora("Authenticating...").start();
        let token;
        if (options.username) {
            if (!options.password) {
                if (!options.raw) spinner.fail("When using username/e-mail, you must also specify a password.");
                process.exit(1);
            }
            if (!options.raw) {
                // TODO password auth
                spinner.fail("Password authentication is not currently supported. Please use --token.");
                process.exit(1);
            }
        }
        else if (options.token) {
            token = options.token;
            const client = new ApiClient(token);
            // check authentication
            const res = await client.auth.check();
            if (res._res.status === 401) {
                if (!options.raw) {
                    spinner.fail("The specified token is invalid.");
                    emphasize.highlight("JSON", JSON.stringify(res, null, 2));
                }
                process.exit(1);
            }
            else {
                // write token to .token file. file may not exist, so create it if it doesn't
                try {
                    await writeFile(".token", token);
                    if (options.raw) console.log(token);
                    else spinner.succeed("Authentication successful.");
                }
                catch (e) {
                    if (!options.raw) {
                        spinner.fail("Could not create .token file.");
                        console.error(e);
                    }
                    process.exit(1);
                }
            }
        }
        else {
            // TODO oauth login
            spinner.fail("OAuth authentication is not currently supported. Please use --token.");
            process.exit(1);
        }
    });

/**
 * Endpoints
 */
//check
program.command("check")
    .description("Basic request details")
    .option("-h, --headers", "Return only response headers")
    .option("-b, --body", "Return only response body")
    .option("--raw", "Return raw response body")
    .action(async options => {
        const spinner = !options.raw ? ora("Sending request...").start() : null;
        const api = apiClient ? apiClient : new ApiClient("token_null");
        if (options.headers) options.body = false;
        else if (options.body) options.headers = false;
        try {
            const res = await api.check();
            if (options.raw) console.log(JSON.stringify(res));
            else {
                if (res._res.status < 400) spinner.succeed(`${res._res.status}: ${res._res.statusText}`);
                else spinner.fail(`${res._res.status}: ${res._res.statusText}`);
                console.log(formatResponse(res, options.headers, options.body));
            }
        }
        catch (e) {
            if (!options.raw) {
                spinner.fail(`An error occurred`);
                console.error(e);
            }
            process.exit(1);
        }
    });

// auth.check
program.command("auth/check")
    .description("Check request authentication")
    .option("--raw", "Return raw response body")
    .option("-h, --headers", "Return only response headers")
    .option("-b, --body", "Return only response body")
    .option("-t, --token <token>", "API token")
    .action(async options => {
        const spinner = !options.raw ? ora("Sending request...").start() : null;
        const api = options.token ? new ApiClient(options.token) : apiClient;
        if (options.headers) options.body = false;
        else if (options.body) options.headers = false;
        if (!apiClient) {
            if (!options.raw) spinner.fail(`You are not authenticated. You can pass a token with --token. To authenticate all future requests, see '${config.command.name} help login'.`);
            process.exit(1);
        }
        try {
            const res = await api.auth.check();
            if (options.raw) console.log(JSON.stringify(res));
            else {
                if (res._res.status < 400) spinner.succeed(`${res._res.status}: ${res._res.statusText}`);
                else spinner.fail(`${res._res.status}: ${res._res.statusText}`);
                console.log(formatResponse(res, options.headers, options.body));
            }
        }
        catch (e) {
            if (!options.raw) {
                spinner.fail(`An error occurred`);
                console.error(e);
            }
            process.exit(1);
        }
    });

program.on("command:*", () => {
    console.error(`Invalid command: ${program.args.join(" ")}\nSee --help for a list of available commands.`);
    process.exit(1);
});

program.parse(process.argv);

/**
 * Format response (syntax highlighting, etc.)
 * @param {ApiResponse} res
 * @param {boolean} headers
 * @param {boolean} body
 * @returns {string}
 */
const formatResponse = (res, headers = true, body = true) => {
    const ho = Object.fromEntries(res._res.headers.entries());
    const h = headers ? Object.keys(ho).map(k => `\x1b[96m${k}\x1b[0m: ${ho[k]}`).join("\n") : null;
    const b = body ? emphasize.highlight("JSON", JSON.stringify(res, null, 2)).value : null;
    return [h, b].filter(k => !!k).join("\n\n");
}
