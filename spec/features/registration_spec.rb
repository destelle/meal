require 'rails_helper'

describe 'RegistrationForm' do
  feature 'Navigates Registration Form', js: true do
    let!(:user) { User.create!(name: 'Matt', email: 'matt@matt.com', password: 'password') }
    it ' Shows the Form' do
      visit '/'
      click_on 'register'
      expect(page).to have_content 'New Account'
    end

    it 'is able to click on the register button, not register' do
      visit '/'
      click_on 'register'
      fill_in 'Full Name', with: 'Tester Name'
      fill_in 'Password', with: 'password'
      click_on 'Register'
      expect(find('ul')).to have_content "email can't be blank"
    end

    it 'is able to click on the register button, not register' do
      visit '/'
      click_on 'register'
      fill_in 'Full Name', with: 'Tester Name'
      fill_in 'Email', with: 'matt@matt.com'
      fill_in 'Password', with: 'password'
      click_on 'Register'
      expect(find('ul')).to have_content "email has already been taken"
    end

    it 'is able to fill the register form, register and render the user show page' do
      visit '/'
      click_on 'register'
      fill_in 'Full Name', with: 'Tester Name'
      fill_in 'Email', with: 'tester23@test.com'
      fill_in 'Password', with: 'password'
      click_on 'Register'
      expect(find('.col-xs-10').find('h2')).to have_content('Your Meals')
    end



  end
end
