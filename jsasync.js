
var jsasync = (function() {
	function jsasync(self) {
		this.self = self;
	}
	jsasync.prototype.var = function(idx) {
	};
	jsasync.prototype._seq_itm = function(seq_idx) {
		var seq = seq_idx[0];
		var idx = seq_idx[1];
		var itm = seq;
		for(var i = idx.length - 1; i > -1; i--) {
			if(idx[i] >= itm.length) {
				if(i != 0) throw 'assert';
				return null;
			}
			itm = itm[idx[i]];
		}
		return itm;
	};
	jsasync.prototype._seq_cur = function(seq_idx, bra) {
		if(!bra) bra = 0;
		var itm = this._seq_itm(seq_idx);
		if(itm == null) {
			if(seq_idx[1].length < 2) return null;
			seq_idx[1].shift();
			seq_idx[1][0] ++;
			bra = -1;
		} else if(itm instanceof Array) {
			if(bra != 0) {
				seq_idx[1][0] ++;
				bra --;
			} else {
				seq_idx[1].unshift(0);
			}
		} else {
			if(bra > 0) throw 'Branch failed.';
			return seq_idx;
		}
		return this._seq_cur(seq_idx, bra);
	};
	jsasync.prototype._seq_next = function(seq_idx, bra) {
		if(seq_idx[1] == null) seq_idx[1] = [0];
		else seq_idx[1][0] ++;
		return this._seq_cur(seq_idx, bra);
	};
	jsasync.prototype.MAX_RETRY = 5;
	jsasync.prototype._run_hndl = function(si, tar, tar_idx, scp, retry, varg, bra, args) {
		var itm = this._seq_itm(si);
		var hndl = {};
		if(varg) {
			args = Array.prototype.slice.call(arguments, 7);
		}
		if(typeof(itm) == 'function') {
			hndl.var = function(k, v) {
				if(v == undefined)
					return scp[k];
				else
					scp[k] = v;
			};
			if(retry >= this.MAX_RETRY) throw 'Retry out of time.'
			hndl.retry = this._run_hndl.bind(this, si, tar, tar_idx.slice(), scp, retry + 1, false, bra, args);
			if(tar.length > 0) {
				var tar_itm, idx, len;
				hndl.each = [];
				for(var i = 0; i < tar.length; i++) {
					tar_itm = scp[tar[i]];
					idx = tar_idx[i];
					if(!(tar_itm instanceof Array)) {
						idx = Object.keys(tar_itm)[idx];
					}
					hndl.each.push([idx, tar_itm[idx]]);
				}
				var ti = 0;
				while(ti < tar.length) {
					tar_itm = scp[tar[ti]];
					idx = tar_idx[ti];
					if(tar_itm instanceof Array) {
						len = tar_itm.length;
					} else {
						len = Object.keys(tar_itm).length;
					}
					if(idx < len - 1) {
						tar_idx[ti] ++;
						for(var i = 0; i < ti; i ++)
							tar_idx[i] = 0;
						break;
					}
					ti ++;
				}
				if(bra > 0) {
					return this._run_hndl_next(si, [], [], scp, 0, false, 0, args);
				}
				if(ti >= tar.length) bra = 1;
				hndl.break = this._run_hndl.bind(this, si, tar, tar_idx, scp, 0, true, 1);
				hndl.continue = this._run_hndl.bind(this, si, tar, tar_idx, scp, 0, true, bra);
				return itm.apply(this.self, [hndl].concat(args));
			} else {
				hndl.return = this._run_hndl_next.bind(this, si, [], [], scp, 0, true, 0);
				hndl.branch = this._run_hndl_next.bind(this, si, [], [], scp, 0, true);
				return itm.apply(this.self, [hndl].concat(args));
			}
		} else {
			tar.push(itm);
			tar_idx.push(0);
			return this._run_hndl_next(si, tar, tar_idx, scp, 0, false, 0, args);
		}
	};
	jsasync.prototype._run_hndl_next = function(si, tar, tar_idx, scp, retry, varg, bra, args) {
		si = this._seq_next(si, bra);
		if(si == null) return;
		arguments[0] = si
		this._run_hndl.apply(this, arguments);
	};
	jsasync.prototype.run = function(seq, args) {
		var si = [seq, null];
		return this._run_hndl_next(si, [], [], {}, 0, false, 0, args);
	};
	jsasync.prototype.foreach = function() {
	};
	return jsasync;
})();

function f1(hndl) { hndl.var('t1', [1,2,3,4]); hndl.var('flag', true); console.log('f1', arguments); hndl.return(1, 2, 3) }
function f2(hndl) { hndl.var('t2', {a:123, b:456}); console.log('f2', arguments); if(hndl.var('flag')) hndl.branch(1, 777); hndl.return(888) }
function f3(hndl) { console.log('f3', arguments); if(!hndl.var('flag')){hndl.var('flag', true);hndl.retry()};hndl.return(666) }
function f4(hndl) { console.log('f4', arguments, hndl.each); hndl.continue(4, 5) }
function f5(hndl) { console.log('f5', arguments); hndl.return() }
seq = [f1, f2, [f3], ['t1', 't2', f4], f5];
foo = new jsasync;
foo.run(seq, ['go']);
