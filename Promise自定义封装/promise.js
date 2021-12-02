class Promise{
    constructor(executor){
        //添加属性
        this.PromiseState = 'pending';
        this.PromiseResult = null;
        //声明属性
        this.callbacks = []
        //resolve 函数
        const self = this;
        function resolve(data){
            //判断状态，状态只能修改一次
            if(self.PromiseState !== 'pending') return
            //1.修改对象的状态 promiseState
            self.PromiseState = 'fulfilled'
            //2.设置对象结果值 promiseResult
            self.PromiseResult = data;
            //调用成功的回调函数
            setTimeout(() => {
                self.callbacks.forEach((item) => {
                    item.onResolved(data)
                })
            });
        }

        //reject 函数
        function reject(data){
            //判断状态，状态只能修改一次
            if(self.PromiseState !== 'pending') return
            //1.修改对象的状态 promiseState
            self.PromiseState = 'rejected'
            //2.设置对象结果值 promiseResult
            self.PromiseResult = data;
            //调用成功的回调函数
            setTimeout(() => {
                self.callbacks.forEach((item) => {
                    item.onRejected(data)
                })
            });
        }
        try {
            //同步调用执行器函数
            executor(resolve, reject); 
        } catch (error) {
            //修改promise对象状态为「失败」
            reject(error)
        }
    }

    then(onResolved, onRejected){
        const self = this;
        if(typeof onRejected !== 'function'){
            onRejected = reason => {
                throw reason;
            }
        }
        if(typeof onResolved !== 'function'){
            onResolved = value => value;
        }
        
        return new Promise((resolve, reject) => {
            //封装函数
            function callback(type){
                try {
                    //获取回调函数的执行结果
                    let result = type(self.PromiseResult);
                    if(result instanceof Promise){
                        //如果是Promise类型的对象
                        result.then(v => {
                            resolve(v)
                        }, e => {
                            reject(e)
                        })
                    }else{
                        //结果的对象状态为成功 
                        resolve(result)
                    }         
                } catch (error) {
                    reject(error)
                }
            }
            //调用回调函数
            if(this.PromiseState === 'fulfilled'){
                setTimeout(() => {
                    callback(onResolved)
                });
            }

            if(this.PromiseState === 'rejected'){
                setTimeout(() => {
                    callback(onRejected)
                });
            }
            //判断 pending状态
            if(this.PromiseState === 'pending'){
                //保存回调函数
                this.callbacks.push({
                    onResolved: function(){
                        callback(onResolved)
                    },
                    onRejected: function(){
                        callback(onRejected)
                        
                    }
                })
            }
        })
    }

    catch(onRejected){
        return this.then(undefined, onRejected);
    }

    //添加resolve方法,static代表该变量属于累，不属于这个类的实例
    static resolve(value){
        //返回promise对象
        return new Promise((resolve, reject) => {
            if(value instanceof Promise){
                value.then(v => {
                    resolve(v)
                }, r => {
                    reject(r)
                })
            }else{
                resolve(value)
            }
        })
    }

    //添加reject方法
    static reject = function(reason){
        return new Promise((resolve, reject) => {
            reject(reason);
        })
    }

    //添加all方法
    static all = function(promises){
        //声明变量
        let count = 0;
        let arr = [];
        //返回结果为promise对象
        return new Promise((resolve, reject) => {
            //遍历
            for(let i=0; i<promises.length; i++){
                promises[i].then(v => {
                    //得知对象的状态是成功
                    //每个promise对象都成功
                    count++;
                    //将当前promise对象成功的结果存入到数组中
                    arr[i] = v;
                    if(count === promises.length){
                        resolve(arr);
                    }
                }, r => {
                    reject(r)
                })
            }
        })
    }

    static race = function(promises){
        return new Promise((resolve, reject) => {
            for (let i = 0; i < promises.length; i++) {
                promises[i].then(v => {
                    resolve(v);
                }, r => {
                    //修改返回对象的状态为「失败」
                    reject(r)
                })
                
            }
        })
    }
}
