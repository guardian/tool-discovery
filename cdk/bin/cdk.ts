#!/usr/bin/env node
import "source-map-support/register";
import * as cdk from "@aws-cdk/core";
import { ToolDiscoveryLambdaStack } from "../lib/tool-discovery-lambda-stack";

const app = new cdk.App();
new ToolDiscoveryLambdaStack(app, "ToolDiscoveryLambdaStack");
