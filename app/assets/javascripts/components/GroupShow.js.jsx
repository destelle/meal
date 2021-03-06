class GroupShow extends React.Component {
  constructor () {
    super()
    this.state = {
      title: null,
      adminId: null,
      activeMembers: [],
      members: [],
      hangoutId: null,
      inHangout: false,
      centerPoint: '',
      currentEmail: null,
      errors: null,
      hangoutAdmin: null,
      locationError: null,
      curretUserId: null,
      lockedOut: false
    }
    this.joinHangout = this.joinHangout.bind(this)
    this.createHangout = this.createHangout.bind(this)
    this.leaveHangout =  this.leaveHangout.bind(this)
    this.deleteHangout = this.deleteHangout.bind(this)
    this.lockHangout = this.lockHangout.bind(this)
  }

  componentDidMount () {
    let page = this
    $.ajax({
      url: '/groups/' + this.props.groupId,
      type: 'GET'
    }).done(function (response) {
      page.setState({
        activeMembers: response.activeMembers,
        title: response.groupTitle,
        adminId: response.groupAdminId,
        members: response.groupMembers,
        hangoutId: response.hangoutId,
        inHangout: response.inHangout,
        centerPoint: response.centerPoint,
        hangoutAdmin: response.hangoutAdmin,
        curretUserId: response.curretUserId,
        lockedOut: response.lockedOut
      })
    })
  }

  handleInvite (event) {
    event.preventDefault()
    let form = this
    if (this.state.currentEmail) {
      let request = $.ajax({
        type: 'POST',
        url: '/groups/' + form.props.groupId + '/members',
        data: {currentEmail: this.state.currentEmail}
      })

      request.success((response) => {
        $('#member-list').append('<div>' + response.username + '</div>')
      })

      request.fail((response) => {
        var error = response.responseJSON['errors']
        form.setState({
          errors: error,
          currentEmail: null
        })
      })
    }
    $("input[type='email']").val('')
  }

  handleEmailChange (event) {
    this.setState({
      currentEmail: event.target.value
    })
  }

  addMembers () {
    function closeIt () {
      event.preventDefault()
    }

    if (this.props.sessionID) {
      return (
        <div className='card group-content'>
          <div className='card-header'>
            <div id='collapseExample' className='card-body text-center collapse'>
              <div className='well'>
                <form action='/users' method='post'>
                  <div className='errors errors-container'>
                    {this.state.errors}
                  </div>
                  <div className='form-group'>
                    <input type='email' name='email' onChange={this.handleEmailChange.bind(this)} className='form-control' placeholder='johndoe@email.com' />
                  </div>
                  <div className='register-btn'>
                    <button onClick={this.handleInvite.bind(this)} className='btn btn-default'>Invite User</button>
                    <a data-toggle='collapse' data-target='#collapseExample' id='closeInvitation'>x</a>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  memberIsHanging (member) {
    if (this.state.activeMembers) {
      if (this.state.activeMembers.includes(member)) {
        return (
          <button className='btn btn-default btn-xs'><span className='glyphicon glyphicon-cutlery glyphicon-align-left' aria-hidden='true' /></button>
        )
      }
    }
  }

  showMembers () {
    if (this.state.members) {
      let n = 0
      return (
        this.state.members.map((member, n) => {
          n++
          return (
            <div key={this.state.title + n}>{member} {this.memberIsHanging(member)} </div>
          )
        })
      )
    }
  }

  joinHangout () {
    if (this.state.hangoutId != null) {
      this.hangOutHelper('/groups/' + this.props.groupId + '/hangouts/' + this.state.hangoutId, 'PATCH')
    }
  }

  createHangout () {
    if (this.state.hangoutId == null) {
      this.hangOutHelper('/groups/' + this.props.groupId + '/hangouts', 'POST')
    }
  }

  hangOutHelper (url, type) {
    let page = this
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(sendPosition, showError)
    } else {
      $('#location-error').html('We apologize, but your browser does not support location services used by our app.')
    }
    function showError (error) {
      let errorMessage
      switch (error.code) {
        case error.PERMISSION_DENIED:
          errorMessage = 'Please enable location services to participate in a hangout. Refresh the page and try again.'
          break
        case error.POSITION_UNAVAILABLE:
          errorMessage = 'Sorry, but we cannot find your location. Please refresh the page and try again.'
          break
        case error.TIMEOUT:
          errorMessage = 'Sorry, but it took too long to find your location. Please refresh the page and try again.'
          break
        case error.UNKNOWN_ERROR:
          errorMessage = 'An unknown error occurred. Please refresh the page and try again.'
      }
      page.setState({locationError: errorMessage})
    }

    function sendPosition (position) {
      $('#location-error').empty()
      let lat = position.coords.latitude
      let long = position.coords.longitude

      function sendRequest (page, result) {
        var joinRequest = $.ajax({
          url: url,
          type: type,
          data: {lat: lat, long: long}
        })
        joinRequest.done((response) => {
          result(response, page)
        })
      }
      sendRequest(page, function (result, page) {
        page.setState({
          activeMembers: result.activeMembers,
          inHangout: result.inHangout,
          centerPoint: result.centerPoint,
          hangoutId: result.hangoutId,
          hangoutAdmin: result.hangoutAdmin,
          lockedOut: result.lockedOut
      })
    })
  }
}

  leaveHangout () {
    let page = this
    var request = $.ajax ({
      url: '/groups/' + this.props.groupId + '/hangouts/' + this.state.hangoutId + '/leave',
      type: 'PUT'
    })

    request.done((response) => {
      page.setState({
        inHangout: response.inHangout,
        activeMembers: response.activeMembers
      })
      if (page.state.activeMembers.length === 0) {
        page.deleteHangout()
      }
    })
  }

  returnRestaurants () {
    if (this.state.centerPoint && this.state.inHangout) {
      getRestaurants(parseFloat(this.state.centerPoint.average_lat), parseFloat(this.state.centerPoint.average_long))
    } else {
      $('.restaurants-list').html('')
    }
  }

  deleteHangout() {
    let page = this
    var request = $.ajax ({
      url: '/groups/' + this.props.groupId + '/hangouts/' + this.state.hangoutId + '/delete',
      type: 'DELETE'
    })
    request.done((response) => {
      page.setState({
        activeMembers: [],
        hangoutId: null,
        inHangout: false,
        centerPoint: '',
        hangoutAdmin: null,
        lockedOut: null
      })
    })
  }

  lockHangout () {
    let page = this
    var request = $.ajax ({
      url: '/groups/' + this.props.groupId + '/hangouts/' + this.state.hangoutId + '/lock',
      type: 'PUT'
    })

    request.done((response) => {
      page.setState({
        lockedOut: response.locked_out
      })
    })
  }

  render () {
    return (
      <div className='card content'>
        <div className='card-body group-show'>
          <div className='card group-content hangout-button' >
            <Dropdown lockedOut={this.state.lockedOut} lockHangout={this.lockHangout} groupAdminId={this.state.adminId} joinHangout={this.joinHangout} createHangout={this.createHangout} deleteHangout={this.deleteHangout} hangoutAdminId={this.state.hangoutAdmin} userId={this.state.curretUserId} leaveHangout={this.leaveHangout} hangoutId={this.state.hangoutId} inHangout={this.state.inHangout} />
            <LocationError locationError={this.state.locationError} />
          </div>
          <div className='card group-content ' >
            <div className='card-header'>
              <h3>Group Name</h3>
            </div>
            <div className='card-body text-center'>
              {this.state.title}
            </div>
          </div>
          <div className='card group-content' >
            <div className='card-header'>
              <h3>Members</h3>
            </div>
            <div id='member-list' className='card-body text-center'>
              {this.showMembers()}
            </div>
          </div>
          <div className='card group-content'>
            <div className='form-show'>
              {this.addMembers()}
            </div>
          </div>
          <div className='card group-content' >
            <div className='card-header'>
              <div className='restaurants-list'>
                {this.returnRestaurants()}
              </div>
            </div>
            <div className='card-body text-center'>
              <div className='map' />
              <p className='restaurants' />
            </div>
          </div>
        </div>
      </div>
    )
  }
}
