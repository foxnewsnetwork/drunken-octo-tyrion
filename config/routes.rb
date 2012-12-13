Unfactory::Application.routes.draw do

  resources :materials, :only => [:destroy]
  resources :invoices, :only => [:show, :edit, :update, :destroy] do
    member do
      post :connect
      # post :from
      # post :to
    end # member
  end # resources
  devise_for :users
  resources :users, :only => [:show, :edit, :update, :index] do
    member do 
      put :level
    end # member
  end # user
  
  resources :companies do 
    resources :orders, :except => [:create, :destroy, :new]
  end # companies

  resources :orders, :except => [:create, :new] do 
    member do
      post :update_material
    end # member
    resources :materials
    resources :invoices, :only => [:index]
  end # orders

  resources :plants do
    resources :outgoing_invoices, :only => [:new, :create, :index] do
      member do
        post :to
      end # member
    end # outgoing
    resources :incoming_invoices, :only => [:new, :create, :index] do
      member do
        post :from
      end # member
    end # outgoing
    resources :materials, :only => [:index]
    [:sales, :purchases].each do |transaction|
      resources transaction, :only => [:index, :new] do 
        member do 
          post :material
          post :finish
          post :start
        end # member
      end # resources
    end # transaction
  end # plants

  ['about','faq'].each do |path|
    match path, :to => "pages##{path}"
  end # pages

  # The priority is based upon order of creation:
  # first created -> highest priority.

  # Sample of regular route:
  #   match 'products/:id' => 'catalog#view'
  # Keep in mind you can assign values other than :controller and :action

  # Sample of named route:
  #   match 'products/:id/purchase' => 'catalog#purchase', :as => :purchase
  # This route can be invoked with purchase_url(:id => product.id)

  # Sample resource route (maps HTTP verbs to controller actions automatically):
  #   resources :products

  # Sample resource route with options:
  #   resources :products do
  #     member do
  #       get 'short'
  #       post 'toggle'
  #     end
  #
  #     collection do
  #       get 'sold'
  #     end
  #   end

  # Sample resource route with sub-resources:
  #   resources :products do
  #     resources :comments, :sales
  #     resource :seller
  #   end

  # Sample resource route with more complex sub-resources
  #   resources :products do
  #     resources :comments
  #     resources :sales do
  #       get 'recent', :on => :collection
  #     end
  #   end

  # Sample resource route within a namespace:
  #   namespace :admin do
  #     # Directs /admin/products/* to Admin::ProductsController
  #     # (app/controllers/admin/products_controller.rb)
  #     resources :products
  #   end

  # You can have the root of your site routed with "root"
  # just remember to delete public/index.html.
  root :to => 'pages#home'

  # See how all your routes lay out with "rake routes"

  # This is a legacy wild controller route that's not recommended for RESTful applications.
  # Note: This route will make all actions in every controller accessible via GET requests.
  # match ':controller(/:action(/:id))(.:format)'
end
