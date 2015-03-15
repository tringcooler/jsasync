
var jsasync = (function() {
	function jsasync(self) {
		this.self = self;
	}
	jsasync.prototype.return = function() {
	};
	jsasync.prototype.branch = function() {
	};
	jsasync.prototype.retry = function() {
	};
	jsasync.prototype.end = function() {
	};
	jsasync.prototype.var = function(idx) {
	};
	jsasync.prototype._seq_next = function(seq_idx, bra) {
		var seq = seq_idx[0];
		var idx = seq_idx[1];
		if(!bra) bra = 0;
		if(idx == null) idx = 0;
		else idx ++;
		if(idx >= seq.length) return null;
		var itm = seq[idx];
		while(itm instanceof Array && bra > 0) {
			idx ++;
			bra --;
			if(idx >= seq.length) return null;
			itm = seq[idx];
		}
		if(bra > 1) throw 'Branch failed.';
		while(itm instanceof Array) {
			seq = itm;
			idx = 0;
			if(idx >= seq.length) return null;
			itm = seq[idx];
		}
		/*if(itm instanceof Array) {
			if(bra > 0)
				return this._seq_next([seq, idx+1], bra-1);
			else
				return this._seq_next([itm, 0], bra);
		}
		if(bra > 1) throw 'Branch failed.';*/
		return [seq, idx];
	};
	jsasync.prototype._run_next = function(si, bra, tar, tar_idx, scp, args) {
		var itm = si[0][si[1]];
		if(typeof(itm) == 'function') {
			if(tar.length > 0) {
				
			}
		} else {
			tar.push(itm);
			tar_idx.push(0);
			si = this._seq_next(si, bra);
			return this._run_next(si, 0, tar, tar_idx, scp, args);
		}
		var meth = {
			
		}
	};
	jsasync.prototype.run = function(seq) {
		var si = [seq, null];
		var bra = null;
		while(si = this._seq_next(si, bra)) {
			var func = si[0][si[1]];
			if(typeof(func) == 'function') {
				
			} else {
				var tar = func;
				si = this._seq_next(si);
				func = si[0][si[1]];
			}
		}
	};
	jsasync.prototype.foreach = function() {
	};
	return jsasync;
})();
