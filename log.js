"use strict";

const winston = require('winston')
const path = require('path')
const PROJECT_ROOT = path.join(__dirname, '../../')

function getStackInfo(stackIndex) {
  const stacklist = (new Error()).stack.split('\n').slice(3)

  const stackReg = /at\s+(.*)\s+\((.*):(\d*):(\d*)\)/gi
  const stackReg2 = /at\s+()(.*):(\d*):(\d*)/gi

  const s = stacklist[stackIndex] || stacklist[0]
  const sp = stackReg.exec(s) || stackReg2.exec(s)

  if (sp && sp.length === 5) {
    return {
      method: sp[1],
      relativePath: path.relative(PROJECT_ROOT, sp[2]),
      line: sp[3],
      pos: sp[4],
      file: path.basename(sp[2]),
      stack: stacklist.join('\n'),
    }
  }
}

function formatLogArguments(iargs) {
  const args = Array.prototype.slice.call(iargs)
  const stackInfo = getStackInfo(1)
  if (stackInfo) {
    const calleeStr = '(' + stackInfo.relativePath + ':' + stackInfo.line + ')'
    args.unshift(calleeStr)
  }
  return args
}

const args = process.argv
let level = 'info'
let needConsole = false
args.forEach(function(arg) {
  if (arg === 'verbose') {
    level = 'debug'
  }
  if(arg === 'console'){
    needConsole = true
  }
})

const logger = new(winston.Logger)({
  transports: [
    new(winston.transports.Console)({
      level: level,
      colorize: true,
    }),
  ],
})

function debug() {
  logger.debug.apply(logger, formatLogArguments(arguments))
}
module.exports.debug = debug

function info() {
  logger.info.apply(logger, formatLogArguments(arguments))
  if(needConsole){
    process.stdout.emit('data', arguments[0])
  }
}
module.exports.info = info

function warn() {
  logger.warn.apply(logger, formatLogArguments(arguments))
  if(needConsole){
    process.stdout.emit('data', arguments[0])
  }
}
module.exports.warn = warn

function error() {
  logger.error.apply(logger, formatLogArguments(arguments))
  if(needConsole){
    process.stdout.emit('data', arguments[0])
  }
}
module.exports.error = error
