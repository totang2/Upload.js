import should from 'should'; // eslint-disable-line no-unused-vars
import sinon from 'sinon';
import upload from '../../../src/js/core/actions/upload';
import options from '../../../src/js/core/util/options';
import events from '../../../src/js/core/util/events';
import queue from '../../../src/js/core/util/queue';

describe('fileUpload', () => {
  let opts;
  let http;
  let ev;
  let up;

  beforeEach(() => {
    opts = options({
      allowed_types: ['jpeg'],
      upload: {
        url: '/upload',
        param: 'file',
        additionalParams: {
          test: 'val1',
        },
        headers: {
          header1: 'val2',
        },
      },
    });

    http = sinon.stub();

    ev = events();

    up = upload(http, ev, opts, queue((item, done) => {
      item(done);
    }, { delay: 0 }));
  });

  it('When uploading a file and it is successful it should call the success listener', (done) => {
    const mockHttp = {};
    mockHttp.progress = sinon.stub().returns(mockHttp);
    mockHttp.done = sinon.stub().returns(mockHttp);
    mockHttp.fail = sinon.stub().returns(mockHttp);

    http.returns(mockHttp);

    const file = {
      type: 'jpeg',
    };

    const mockListener = sinon.spy();
    ev.on('upload.added', 222, mockListener);
    ev.on('upload.started', 222, mockListener);
    ev.on('upload.rejected', 222, mockListener);
    ev.on('upload.progress', 222, mockListener);
    ev.on('upload.fail', 222, mockListener);
    ev.on('upload.done', 222, (event) => {
      event.should.be.eql({
        type: 'upload.done',
        file,
        id: 222,
        uploadImageId: '111',
      });

      mockListener.callCount.should.be.equal(5);
      mockListener.getCall(2).args.should.be.eql([{
        type: 'upload.progress',
        file,
        id: 222,
        progress: 10,
      }]);
      mockListener.getCall(3).args.should.be.eql([{
        type: 'upload.progress',
        file,
        id: 222,
        progress: 60,
      }]);
      mockListener.getCall(4).args.should.be.eql([{
        type: 'upload.progress',
        file,
        id: 222,
        progress: 100,
      }]);

      done();
    });

    up.upload({ file, id: 222 });

    mockListener.calledTwice.should.be.True();
    mockListener.firstCall.args.should.be.eql([{
      type: 'upload.added',
      id: 222,
      file,
    }]);
    mockListener.secondCall.args.should.be.eql([{
      type: 'upload.started',
      id: 222,
      file,
    }]);

    setTimeout(() => {
      mockHttp.progress.callArgWith(0, 10);
      mockHttp.progress.callArgWith(0, 60);
      mockHttp.progress.callArgWith(0, 100);
      mockHttp.done.callArgWith(0, { success: true, uploadImageId: '111' });
    }, 10);
  });

  it('When uploading a file and it fails because success flag is false it should call the fail ' +
    'listener',
    (done) => {
      const mockHttp = {};
      mockHttp.progress = sinon.stub().returns(mockHttp);
      mockHttp.done = sinon.stub().returns(mockHttp);
      mockHttp.fail = sinon.stub().returns(mockHttp);

      http.returns(mockHttp);

      const file = {
        type: 'jpeg',
      };

      const mockListener = sinon.spy();
      ev.on('upload.added', 333, mockListener);
      ev.on('upload.started', 333, mockListener);
      ev.on('upload.rejected', 333, mockListener);
      ev.on('upload.progress', 333, mockListener);
      ev.on('upload.done', 333, mockListener);
      ev.on('upload.failed', 333, (event) => {
        event.should.be.eql({
          type: 'upload.failed',
          id: 333,
          file,
        });

        mockListener.callCount.should.be.equal(3);
        mockListener.getCall(2).args.should.be.eql([{
          type: 'upload.progress',
          file,
          id: 333,
          progress: 10,
        }]);

        done();
      });

      up.upload({ file, id: 333 });

      mockListener.calledTwice.should.be.True();
      mockListener.firstCall.args.should.be.eql([{
        type: 'upload.added',
        id: 333,
        file,
      }]);
      mockListener.secondCall.args.should.be.eql([{
        type: 'upload.started',
        id: 333,
        file,
      }]);

      setTimeout(() => {
        mockHttp.progress.callArgWith(0, 10);
        mockHttp.fail.callArgWith(0);
      }, 10);
    });

  it('When uploading a file and it fails it should call the fail listener', (done) => {
    const mockHttp = {};
    mockHttp.progress = sinon.stub().returns(mockHttp);
    mockHttp.done = sinon.stub().returns(mockHttp);
    mockHttp.fail = sinon.stub().returns(mockHttp);

    http.returns(mockHttp);

    const file = {
      type: 'jpeg',
    };

    const mockListener = sinon.spy();
    ev.on('upload.added', 333, mockListener);
    ev.on('upload.started', 333, mockListener);
    ev.on('upload.rejected', 333, mockListener);
    ev.on('upload.progress', 333, mockListener);
    ev.on('upload.done', 333, mockListener);
    ev.on('upload.failed', 333, (event) => {
      event.should.be.eql({
        type: 'upload.failed',
        id: 333,
        file,
      });

      mockListener.callCount.should.be.equal(3);
      mockListener.getCall(2).args.should.be.eql([{
        type: 'upload.progress',
        file,
        id: 333,
        progress: 10,
      }]);

      done();
    });

    up.upload({ file, id: 333 });

    mockListener.calledTwice.should.be.True();
    mockListener.firstCall.args.should.be.eql([{
      type: 'upload.added',
      id: 333,
      file,
    }]);
    mockListener.secondCall.args.should.be.eql([{
      type: 'upload.started',
      id: 333,
      file,
    }]);

    setTimeout(() => {
      mockHttp.progress.callArgWith(0, 10);
      mockHttp.fail.callArgWith(0);
    }, 10);
  });

  it('When uploading a file that is not an allowed type it is rejected', () => {
    const file = {
      type: 'png',
    };

    const mockListener = sinon.spy();
    ev.on('upload.added', 444, mockListener);
    ev.on('upload.started', 444, mockListener);
    ev.on('upload.rejected', 444, mockListener);
    ev.on('upload.progress', 444, mockListener);
    ev.on('upload.done', 444, mockListener);
    ev.on('upload.failed', 444, mockListener);

    up.upload({ file, id: 444 });

    mockListener.calledOnce.should.be.True();
    mockListener.firstCall.args.should.be.eql([{
      type: 'upload.rejected',
      file,
      id: 444,
      rejected: 'type',
    }]);

    http.callCount.should.be.equal(0);
  });
});
