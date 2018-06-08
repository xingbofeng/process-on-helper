module.exports = function(callbackBasedApi) {
  return function promisefied() {
    // 传入的参数值：例如readFile就传入文件路径就行了，不需要回调函数
    const args = [].slice.call(arguments);
    return new Promise((resolve, reject) => {
      // 把回调函数加入
      args.push((err, result) => {
        if (err) {
          // 有错误，直接执行reject
          return reject(err);
        }
        if (arguments.length <= 2) {
          // 除了err只有一个参数
          resolve(result);
        } else {
          // 除了err有多个参数
          resolve([].slice.call(arguments, 1));
        }
      });
      // 合并之前的参数值，传入回调式的API调用回调式的API，并把回调函数置尾的参数传入
      callbackBasedApi.apply(null, args);
    });
  }
}