module ControllerMacros
  def login_user(level)
    before(:each) do
      @request.env["devise.mapping"] = Devise.mappings[:user]
      @current_user = FactoryGirl.create(:user, :level => level)
      # user.confirm! # or set a confirmed_at inside the factory. Only necessary if you are using the confirmable module
      sign_in @current_user
    end # before
  end # login_user
end # module