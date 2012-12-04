class AddGenreToOrders < ActiveRecord::Migration
  def change
    add_column :orders, :genre, :string, :null => false, :default => 'sale'
  end
end
