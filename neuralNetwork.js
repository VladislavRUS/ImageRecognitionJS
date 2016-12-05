var alpha = 0.1;

Array.prototype.setDimension = function (n, m) {
    for (var i = 0; i < n; i++) {
        this[i] = new Array(m);
    }
};

Array.prototype.fillRandom = function (e, h) {
    this.setDimension(e, h);
    for (var i = 0; i < e; i++) {
        for (var j = 0; j < h; j++) {
            this[i][j] = Math.random() * 0.2 + 0.1;
        }
    }
};

function fillArray(arr, n) {
    for (var i = 0; i < n; i++) {
        arr[i] = 0;
    }
}

function Net(enters, hidden, out) {
    return {
        data: {
            patterns: null,
            answers: null,

            enters: null,
            hidden: null,
            out: null,

            wEH: null,
            wHO: null
        },

        init: function () {
            this.data.enters = [];
            this.data.hidden = [];
            this.data.out = [];

            fillArray(this.data.enters, enters);
            fillArray(this.data.hidden, hidden);
            fillArray(this.data.out, out);

            this.data.wEH = [];
            this.data.wHO = [];

            this.data.wEH.fillRandom(this.data.enters.length, this.data.hidden.length);
            this.data.wHO.fillRandom(this.data.hidden.length, this.data.out.length);
        },

        countOut: function () {

            for (var i = 0; i < this.data.hidden.length; i++) {
                for (var j = 0; j < this.data.enters.length; j++) {
                    this.data.hidden[i] += this.data.enters[j] * this.data.wEH[j][i];
                }
                this.data.hidden[i] = 1 / (1 + Math.exp(-alpha * this.data.hidden[i]));
            }
            for (var i = 0; i < this.data.out.length; i++) {
                this.data.out[i] = 0;
                for (var j = 0; j < this.data.hidden.length; j++) {
                    this.data.out[i] += this.data.hidden[j] * this.data.wHO[j][i];
                }
                this.data.out[i] = 1 / (1 + Math.exp(-alpha * this.data.out[i]));
            }
        },

        printOut: function () {
            for (var i = 0; i < this.data.out.length; i++) {
                console.log(this.data.out[i]);
            }
        },

        getBinaryResult: function() {
            var out = [];
            for (var i = 0; i < this.data.out.length; i++) {
                out.push(this.data.out[i] > 0.5 ? 1 : 0);
            }
            return out;
        },

        study: function () {
            var error = 0;
            var iterations = 0;

            console.log(('patterns: ' + this.data.patterns.length));
            this.data.patterns.forEach(function(arr) {
                console.log(arr.join(', '));
            });
            console.log(('answers: ' + this.data.answers));
            console.log('START STUDYING');

            do {
                for (var p = 0; p < this.data.patterns.length; p++) {
                    this.data.enters = this.data.patterns[p].slice(0);
                    this.countOut();

                    var delta_k = [];
                    for (var i = 0; i < this.data.out.length; i++) {
                        delta_k[i] = this.data.out[i] * (1 - this.data.out[i]) * (this.data.out[i] - this.data.answers[p][i]);
                    }

                    error = 0;
                    for (var i = 0; i < delta_k.length; i++) {
                        error += delta_k[i] * delta_k[i];
                    }

                    error /= 2;
                    var delta_j = [];
                    for (var i = 0; i < this.data.hidden.length; i++) {
                        var sum = 0;
                        for (var j = 0; j < this.data.out.length; j++) {
                            sum += delta_k[j] * this.data.wHO[i][j];
                        }
                        delta_j[i] = this.data.hidden[i] * (1 - this.data.hidden[i]) * sum;
                    }

                    for (var i = 0; i < this.data.enters.length; i++) {
                        for (var j = 0; j < this.data.hidden.length; j++) {
                            this.data.wEH[i][j] += -0.1 * delta_j[j] * this.data.enters[i];
                        }
                    }

                    for (var i = 0; i < this.data.hidden.length; i++) {
                        for (var j = 0; j < this.data.out.length; j++) {
                            this.data.wHO[i][j] += -0.1 * delta_k[j] * this.data.hidden[i];
                        }
                    }
                    iterations++;
                    if (iterations % 500 == 0) {
                        console.log('Iterations: ' + iterations + ', error: ' + error);
                    }
                }
            } while (error > 0.001);
            console.log("FINISHED");
        },

        loadPatternsAndAnswers: function (p, a) {
            var pN = p.length;
            var pM = p[0].length;

            this.data.patterns = new Array(pN);

            for (var i = 0; i < pN; i++) {
                this.data.patterns[i] = new Array(pM)
            }

            for (var i = 0; i < pN; i++) {
                for (var j = 0; j < pM; j++) {
                    this.data.patterns[i][j] = p[i][j].toFixed(2);
                }
            }

            var aN = a.length;

            this.data.answers = new Array(aN);

            for (var i = 0; i < aN; i++) {
                this.data.answers[i] = a[i];
            }
        },

        setEnters: function(arr) {
            if (arr.length !== this.data.enters.length) {
                throw new Error('Different length!')
            } else {
                this.data.enters = arr.slice(0);
            }
        }
    }
}