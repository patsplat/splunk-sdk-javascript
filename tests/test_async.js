
// Copyright 2011 Splunk, Inc.
//
// Licensed under the Apache License, Version 2.0 (the "License"): you may
// not use this file except in compliance with the License. You may obtain
// a copy of the License at
//
//     http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS, WITHOUT
// WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied. See the
// License for the specific language governing permissions and limitations
// under the License.

(function() {
    var Splunk      = require('../splunk').Splunk;
    var Async       = Splunk.Async;
    var minitest    = require('../contrib/minitest');


    minitest.context("Async Function Tests", function() {
        this.setupTest(function(done) {
            done();
        });
        
        this.assertion("Parallel success", function(test) {
            Async.parallel([
                function(done) {
                    done(null, 1)  
                },
                function(done) {
                    done(null, 2, 3)
                }],
                function(err, one, two) {
                    test.assert.ok(!err);
                    test.assert.strictEqual(one, 1);
                    test.assert.strictEqual(two[0], 2);
                    test.assert.strictEqual(two[1], 3);
                    test.finished();
                }
            );
        });
        
        this.assertion("Parallel success - no reordering", function(test) {
            Async.parallel([
                function(done) {
                    Async.sleep(1, function() { done(null, 1); });  
                },
                function(done) {
                    done(null, 2, 3)
                }],
                function(err, one, two) {
                    test.assert.ok(!err);
                    test.assert.strictEqual(one, 1);
                    test.assert.strictEqual(two[0], 2);
                    test.assert.strictEqual(two[1], 3);
                    test.finished();
                }
            );
        });
        
        this.assertion("Parallel error", function(test) {
            Async.parallel([
                function(done) {
                    done(null, 1)  
                },
                function(done) {
                    done(null, 2, 3)
                },
                function(done) {
                    Async.sleep(0, function() {
                        done("ERROR");
                    })
                }],
                function(err, one, two) {
                    test.assert.ok(err === "ERROR");
                    test.assert.ok(!one);
                    test.assert.ok(!two);
                    test.finished();
                }
            );
        });
        
        this.assertion("Series success", function(test) {
            Async.series([
                function(done) {
                    done(null, 1)  
                },
                function(done) {
                    done(null, 2, 3)
                }],
                function(err, one, two) {
                    test.assert.ok(!err);
                    test.assert.strictEqual(one, 1);
                    test.assert.strictEqual(two[0], 2);
                    test.assert.strictEqual(two[1], 3);
                    test.finished();
                }
            );
        });
        
        this.assertion("Series reordering success", function(test) {
            var keeper = 0;
            Async.series([
                function(done) {
                    Async.sleep(10, function() {
                        test.assert.strictEqual(keeper++, 0);
                        done(null, 1);
                    });
                },
                function(done) {
                    test.assert.strictEqual(keeper++, 1);
                    done(null, 2, 3)
                }],
                function(err, one, two) {
                    test.assert.ok(!err);
                    test.assert.strictEqual(keeper, 2);
                    test.assert.strictEqual(one, 1);
                    test.assert.strictEqual(two[0], 2);
                    test.assert.strictEqual(two[1], 3);
                    test.finished();
                }
            );
        });
        
        this.assertion("Series error", function(test) {
            Async.series([
                function(done) {
                    done(null, 1)  
                },
                function(done) {
                    done("ERROR", 2, 3)
                }],
                function(err, one, two) {
                    test.assert.strictEqual(err, "ERROR");
                    test.assert.ok(!one);
                    test.assert.ok(!two);
                    test.finished();
                }
            );
        });
        
        this.assertion("Parallel map success", function(test) {
            Async.parallelMap(
                function(val, done) { 
                    done(null, val + 1);
                },
                [1, 2, 3],
                function(err, vals) {
                    test.assert.ok(!err);
                    test.assert.strictEqual(vals[0], 2);
                    test.assert.strictEqual(vals[1], 3);
                    test.assert.strictEqual(vals[2], 4);
                    test.finished();
                }
            );
        });
    });

    if (module === require.main) {
        minitest.run();
    }
})();